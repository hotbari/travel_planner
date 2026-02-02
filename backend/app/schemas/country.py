from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CountryBase(BaseModel):
    code: str
    name: str
    name_ko: Optional[str] = None
    local_name: Optional[str] = None
    greeting: str
    timezone: str


class CountryCreate(CountryBase):
    pass


class Country(CountryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CountryGreeting(BaseModel):
    code: str
    name: str
    greeting: str
