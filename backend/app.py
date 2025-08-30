from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
import sqlite3
import os
import random
import requests
import hashlib

DB_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DB_DIR, "app.db")
os.makedirs(DB_DIR, exist_ok=True)

# 添加全局变量存储API密钥
_baidu_app_id = None
_baidu_secret_key = None

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()
    # Practice logs
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS practice (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            amount INTEGER NOT NULL DEFAULT 1,
            ts TEXT NOT NULL
        )
        """
    )
    # Flashcards for review (SM-2)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            repetitions INTEGER NOT NULL DEFAULT 0,
            interval INTEGER NOT NULL DEFAULT 0,
            easiness REAL NOT NULL DEFAULT 2.5,
            next_review TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


app = FastAPI(title="English Learning App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# Schemas
class TranslateRequest(BaseModel):
    text: str
    source_lang: str = Field("zh", description="Source language code, e.g., zh")
    target_lang: str = Field("en", description="Target language code, e.g., en")


class TranslateResponse(BaseModel):
    translated_text: str


class WritingRequest(BaseModel):
    text: str


class WritingMetrics(BaseModel):
    word_count: int
    sentence_count: int
    unique_words: int
    avg_sentence_length: float
    flesch_reading_ease: float
    estimated_grade_level: float
    suggestions: List[str]


class PracticeLogRequest(BaseModel):
    type: str
    amount: int = 1


class PracticeStats(BaseModel):
    date: str
    totals: Dict[str, int]
    history_7d: List[Dict[str, Any]]


class NewCardRequest(BaseModel):
    front: str
    back: str


class Flashcard(BaseModel):
    id: int
    front: str
    back: str
    next_review: str


class GradeRequest(BaseModel):
    id: int
    quality: int = Field(ge=0, le=5)


class BaiduConfigRequest(BaseModel):
    app_id: str = Field(..., description="百度翻译App ID")
    secret_key: str = Field(..., description="百度翻译Secret Key")

class BaiduConfigResponse(BaseModel):
    status: str
    message: str

class BaiduConfigStatus(BaseModel):
    is_configured: bool
    app_id_masked: Optional[str] = None


def set_baidu_credentials(app_id: str, secret_key: str):
    """
    设置百度翻译API凭证
    """
    global _baidu_app_id, _baidu_secret_key
    _baidu_app_id = app_id
    _baidu_secret_key = secret_key
    print(f"百度翻译API凭证已设置: App ID = {app_id[:6]}..., Secret Key = {secret_key[:6]}...")

def get_baidu_credentials():
    """
    获取百度翻译API凭证
    """
    global _baidu_app_id, _baidu_secret_key
    return _baidu_app_id, _baidu_secret_key

def is_baidu_configured():
    """
    检查百度翻译是否已配置
    """
    app_id, secret_key = get_baidu_credentials()
    return app_id is not None and secret_key is not None

def mask_app_id(app_id: str) -> str:
    """
    遮蔽App ID显示
    """
    if len(app_id) <= 8:
        return "*" * len(app_id)
    return app_id[:4] + "*" * (len(app_id) - 8) + app_id[-4:]

def baidu_translate(text: str, source: str, target: str) -> str:
    """
    使用百度翻译API进行翻译
    """
    # 获取百度翻译API信息
    BAIDU_APP_ID, BAIDU_SECRET_KEY = get_baidu_credentials()
    
    if not text.strip():
        return ""
    
    # 检查是否已配置API密钥
    if not is_baidu_configured():
        print("警告：请先配置百度翻译API密钥")
        return f"[stub {source}->{target}] {text}"
      
    try:
        # 百度翻译API URL
        url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        
        # 生成随机数
        salt = random.randint(32768, 65536)
        
        # 生成签名：appid+q+salt+密钥 的MD5值
        sign_str = BAIDU_APP_ID + text + str(salt) + BAIDU_SECRET_KEY
        sign = hashlib.md5(sign_str.encode('utf-8')).hexdigest()
        
        # 构造请求参数
        params = {
            'q': text,
            'from': source,
            'to': target,
            'appid': BAIDU_APP_ID,
            'salt': salt,
            'sign': sign
        }
        
        print(f"Requesting translation from {source} to {target}: {text}")
        response = requests.get(url, params=params, timeout=5)
        print(f"Baidu Translate API response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Raw API response: {result}")
            
            # 检查是否有错误码
            if 'error_code' in result:
                print(f"Baidu API error code: {result['error_code']}, message: {result.get('error_msg', 'Unknown error')}")
                return f"[stub {source}->{target}] {text}"
            
            # 提取翻译结果
            if 'trans_result' in result and isinstance(result['trans_result'], list):
                translated_parts = [item['dst'] for item in result['trans_result'] if 'dst' in item]
                if translated_parts:
                    translated_text = "".join(translated_parts).strip()
                    print(f"Parsed translation: '{translated_text}'")
                    return translated_text
        
        # 如果API调用失败，回退到原来的占位符实现
        print("Translation API call failed, using fallback")
        return f"[stub {source}->{target}] {text}"
    except Exception as e:
        # 发生异常时回退到占位符实现
        print(f"Translation exception: {str(e)}")
        return f"[stub {source}->{target}] {text}"

# 更新naive_stub_translate函数以使用百度翻译
def naive_stub_translate(text: str, source: str, target: str) -> str:
    return baidu_translate(text, source, target)
def split_sentences(text: str) -> List[str]:
    import re
    sents = re.split(r"(?<=[.!?])\s+", text.strip())
    sents = [s for s in sents if s]
    return sents or ([] if not text.strip() else [text.strip()])


def count_syllables(word: str) -> int:
    # Naive syllable estimator for English words
    import re
    word = word.lower()
    vowels = "aeiouy"
    if not word:
        return 0
    # Remove non-alpha
    word = re.sub(r"[^a-z]", "", word)
    if not word:
        return 0
    # Count groups of vowels
    groups = 0
    prev_is_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_is_vowel:
            groups += 1
        prev_is_vowel = is_vowel
    # Trailing silent 'e'
    if word.endswith("e") and groups > 1:
        groups -= 1
    return max(1, groups)


def writing_metrics(text: str) -> WritingMetrics:
    import re
    words = [w for w in re.findall(r"[A-Za-z']+", text)]
    word_count = len(words)
    sentences = split_sentences(text)
    sentence_count = max(1, len(sentences))
    avg_sentence_length = (word_count / sentence_count) if sentence_count else 0.0
    syllables = sum(count_syllables(w) for w in words)
    if word_count == 0:
        fre = 0.0
        grade = 0.0
    else:
        fre = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllables / max(1, word_count))
        # Rough Flesch-Kincaid Grade Level
        grade = 0.39 * (word_count / sentence_count) + 11.8 * (syllables / max(1, word_count)) - 15.59

    unique_words = len(set(w.lower() for w in words))

    suggestions: List[str] = []
    if text and text[0].islower():
        suggestions.append("Capitalize the first letter of the text.")
    if avg_sentence_length > 25:
        suggestions.append("Sentences are long; consider splitting for clarity.")
    if fre < 30:
        suggestions.append("Text is quite hard to read; simplify vocabulary or sentence structure.")
    if any(w.isupper() and len(w) > 3 for w in words):
        suggestions.append("Avoid ALL CAPS words unless necessary.")

    return WritingMetrics(
        word_count=word_count,
        sentence_count=sentence_count,
        unique_words=unique_words,
        avg_sentence_length=round(avg_sentence_length, 2),
        flesch_reading_ease=round(fre, 2),
        estimated_grade_level=round(grade, 2),
        suggestions=suggestions,
    )


def iso_today() -> str:
    return date.today().isoformat()


def sm2_update(repetitions: int, interval: int, easiness: float, quality: int):
    # SM-2 algorithm update
    if quality < 3:
        repetitions = 0
        interval = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = int(round(interval * easiness))
        repetitions += 1

    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if easiness < 1.3:
        easiness = 1.3

    next_review = date.today() + timedelta(days=max(1, interval))
    return repetitions, interval, easiness, next_review.isoformat()


# Routes
# 2025/8/29添加百度翻译配置相关API端点
@app.post("/api/translate/baidu-config", response_model=BaiduConfigResponse)
def configure_baidu_translate(config: BaiduConfigRequest):
    """
    配置百度翻译API密钥
    """
    if not config.app_id or not config.secret_key:
        raise HTTPException(status_code=400, detail="App ID和Secret Key不能为空")
    
    set_baidu_credentials(config.app_id, config.secret_key)
    return BaiduConfigResponse(
        status="success",
        message="百度翻译API密钥配置成功"
    )

@app.get("/api/translate/baidu-config", response_model=BaiduConfigStatus)
def get_baidu_config_status():
    """
    获取百度翻译配置状态
    """
    is_configured = is_baidu_configured()
    app_id, _ = get_baidu_credentials()
    
    return BaiduConfigStatus(
        is_configured=is_configured,
        app_id_masked=mask_app_id(app_id) if is_configured and app_id else None
    )

@app.delete("/api/translate/baidu-config", response_model=BaiduConfigResponse)
def clear_baidu_config():
    """
    清除百度翻译API密钥配置
    """
    set_baidu_credentials(None, None)
    return BaiduConfigResponse(
        status="success",
        message="百度翻译API密钥已清除"
    )
@app.post("/api/translate", response_model=TranslateResponse)
def translate(req: TranslateRequest):
    translated = naive_stub_translate(req.text, req.source_lang, req.target_lang)
    # Log practice
    conn = get_conn()
    conn.execute(
        "INSERT INTO practice(type, amount, ts) VALUES (?, ?, ?)",
        ("translation", max(1, len(req.text.strip().split())), datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return TranslateResponse(translated_text=translated)


@app.post("/api/write/evaluate", response_model=WritingMetrics)
def evaluate_writing(req: WritingRequest):
    metrics = writing_metrics(req.text)
    # Log practice
    conn = get_conn()
    conn.execute(
        "INSERT INTO practice(type, amount, ts) VALUES (?, ?, ?)",
        ("writing", max(1, metrics.word_count), datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return metrics


@app.post("/api/practice/log")
def log_practice(req: PracticeLogRequest):
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    conn.execute(
        "INSERT INTO practice(type, amount, ts) VALUES (?, ?, ?)",
        (req.type, max(1, req.amount), now),
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "ts": now}


@app.get("/api/practice/stats", response_model=PracticeStats)
def practice_stats(date_str: Optional[str] = None):
    if not date_str:
        date_str = iso_today()
    start = datetime.fromisoformat(date_str)
    end = start + timedelta(days=1)
    conn = get_conn()
    cur = conn.cursor()
    # Totals for the day per type
    cur.execute(
        """
        SELECT type, SUM(amount) as total
        FROM practice
        WHERE ts >= ? AND ts < ?
        GROUP BY type
        """,
        (start.isoformat(), end.isoformat()),
    )
    totals = {row[0]: int(row[1]) for row in cur.fetchall()}

    # 7-day history (including selected date)
    history: List[Dict[str, Any]] = []
    for i in range(6, -1, -1):
        day = start - timedelta(days=i)
        day_end = day + timedelta(days=1)
        cur.execute(
            "SELECT type, SUM(amount) FROM practice WHERE ts >= ? AND ts < ? GROUP BY type",
            (day.isoformat(), day_end.isoformat()),
        )
        h_totals = {r[0]: int(r[1]) for r in cur.fetchall()}
        history.append({"date": day.date().isoformat(), "totals": h_totals})

    conn.close()
    return PracticeStats(date=date_str, totals=totals, history_7d=history)


@app.post("/api/cards")
def add_card(req: NewCardRequest):
    conn = get_conn()
    next_rev = iso_today()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO flashcards(front, back, repetitions, interval, easiness, next_review)
        VALUES (?, ?, 0, 0, 2.5, ?)
        """,
        (req.front.strip(), req.back.strip(), next_rev),
    )
    conn.commit()
    card_id = cur.lastrowid
    conn.close()
    # Log practice: creating a card counts toward review setup
    conn = get_conn()
    conn.execute(
        "INSERT INTO practice(type, amount, ts) VALUES (?, ?, ?)",
        ("review", 1, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "id": card_id}


@app.get("/api/review/today", response_model=List[Flashcard])
def review_today():
    today = iso_today()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, front, back, next_review FROM flashcards WHERE next_review <= ? ORDER BY next_review ASC, id ASC",
        (today,),
    )
    rows = cur.fetchall()
    conn.close()
    cards = [Flashcard(id=row[0], front=row[1], back=row[2], next_review=row[3]) for row in rows]
    return cards


@app.post("/api/review/grade")
def grade_card(req: GradeRequest):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT repetitions, interval, easiness FROM flashcards WHERE id = ?",
        (req.id,),
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Card not found")
    repetitions, interval, easiness = int(row[0]), int(row[1]), float(row[2])
    repetitions, interval, easiness, next_rev = sm2_update(repetitions, interval, easiness, req.quality)
    cur.execute(
        "UPDATE flashcards SET repetitions=?, interval=?, easiness=?, next_review=? WHERE id=?",
        (repetitions, interval, easiness, next_rev, req.id),
    )
    conn.commit()
    conn.close()
    # Log practice
    conn = get_conn()
    conn.execute(
        "INSERT INTO practice(type, amount, ts) VALUES (?, ?, ?)",
        ("review", 1, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "next_review": next_rev}


@app.get("/api/health")
def health():
    return {"status": "ok"}

