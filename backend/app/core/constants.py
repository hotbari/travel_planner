# Popular destinations with local greetings (English + Korean names)
INITIAL_COUNTRIES = [
    {"code": "JP", "name": "Japan", "name_ko": "일본", "local_name": "日本", "greeting": "こんにちは", "timezone": "Asia/Tokyo"},
    {"code": "KR", "name": "South Korea", "name_ko": "대한민국", "local_name": "대한민국", "greeting": "안녕하세요", "timezone": "Asia/Seoul"},
    {"code": "CN", "name": "China", "name_ko": "중국", "local_name": "中国", "greeting": "你好", "timezone": "Asia/Shanghai"},
    {"code": "TW", "name": "Taiwan", "name_ko": "대만", "local_name": "台灣", "greeting": "你好", "timezone": "Asia/Taipei"},
    {"code": "TH", "name": "Thailand", "name_ko": "태국", "local_name": "ประเทศไทย", "greeting": "สวัสดี", "timezone": "Asia/Bangkok"},
    {"code": "VN", "name": "Vietnam", "name_ko": "베트남", "local_name": "Việt Nam", "greeting": "Xin chào", "timezone": "Asia/Ho_Chi_Minh"},
    {"code": "SG", "name": "Singapore", "name_ko": "싱가포르", "local_name": "新加坡", "greeting": "Hello", "timezone": "Asia/Singapore"},
    {"code": "MY", "name": "Malaysia", "name_ko": "말레이시아", "local_name": "Malaysia", "greeting": "Selamat datang", "timezone": "Asia/Kuala_Lumpur"},
    {"code": "ID", "name": "Indonesia", "name_ko": "인도네시아", "local_name": "Indonesia", "greeting": "Halo", "timezone": "Asia/Jakarta"},
    {"code": "PH", "name": "Philippines", "name_ko": "필리핀", "local_name": "Pilipinas", "greeting": "Kamusta", "timezone": "Asia/Manila"},
    {"code": "FR", "name": "France", "name_ko": "프랑스", "local_name": "France", "greeting": "Bonjour", "timezone": "Europe/Paris"},
    {"code": "IT", "name": "Italy", "name_ko": "이탈리아", "local_name": "Italia", "greeting": "Ciao", "timezone": "Europe/Rome"},
    {"code": "ES", "name": "Spain", "name_ko": "스페인", "local_name": "España", "greeting": "Hola", "timezone": "Europe/Madrid"},
    {"code": "DE", "name": "Germany", "name_ko": "독일", "local_name": "Deutschland", "greeting": "Hallo", "timezone": "Europe/Berlin"},
    {"code": "GB", "name": "United Kingdom", "name_ko": "영국", "local_name": "United Kingdom", "greeting": "Hello", "timezone": "Europe/London"},
    {"code": "US", "name": "United States", "name_ko": "미국", "local_name": "United States", "greeting": "Hello", "timezone": "America/New_York"},
    {"code": "AU", "name": "Australia", "name_ko": "호주", "local_name": "Australia", "greeting": "G'day", "timezone": "Australia/Sydney"},
    {"code": "NZ", "name": "New Zealand", "name_ko": "뉴질랜드", "local_name": "Aotearoa", "greeting": "Kia ora", "timezone": "Pacific/Auckland"},
    {"code": "MX", "name": "Mexico", "name_ko": "멕시코", "local_name": "México", "greeting": "Hola", "timezone": "America/Mexico_City"},
    {"code": "BR", "name": "Brazil", "name_ko": "브라질", "local_name": "Brasil", "greeting": "Olá", "timezone": "America/Sao_Paulo"},
]

# Transport modes for OSRM
TRANSPORT_MODES = {
    "walk": "foot",
    "transit": "foot",  # OSRM doesn't support transit, fallback to foot
    "drive": "car",
    "bike": "bike",
}

# OSRM profile mapping
OSRM_PROFILES = {
    "foot": "foot",
    "car": "car",
    "bike": "bike",
}
