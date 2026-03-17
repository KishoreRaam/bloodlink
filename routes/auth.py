import logging
from fastapi import APIRouter, Depends, HTTPException
from mysql.connector import Error as MySQLError

from database import get_connection
from models.user import UserRegister, UserResponse, UserLogin, Token
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(body: UserRegister):
    sql = "INSERT INTO users (email, hashed_password, name, role) VALUES (%s, %s, %s, %s)"
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (body.email, hash_password(body.password), body.name, body.role))
            user_id = cursor.lastrowid
            cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            row = cursor.fetchone()
            cursor.close()
        return UserResponse(**row)
    except MySQLError as exc:
        if exc.errno == 1062:
            raise HTTPException(status_code=409, detail="Email already registered")
        logger.error("DB error registering user: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")


@router.post("/login", response_model=Token)
def login(body: UserLogin):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (body.email,))
            user = cursor.fetchone()
            cursor.close()
    except MySQLError as exc:
        logger.error("DB error during login: %s", exc)
        raise HTTPException(status_code=503, detail="Database error")

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["user_id"]})
    return Token(
        access_token=token,
        user=UserResponse(**user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)
