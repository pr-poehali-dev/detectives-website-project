import os
import json
import hashlib
import requests

def handler(event: dict, context) -> dict:
    """OSINT-поиск по ИНН, авто, адресу, телефону, ФИО, паспорту через checkko.ru"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    try:
        body = json.loads(event.get('body') or '{}')
        search_type = body.get('type', 'inn')
        query = body.get('query', '').strip()

        if not query:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Запрос не может быть пустым'})}

        api_key = os.environ['CHECKKO_API_KEY']
        secret = os.environ['CHECKKO_SECRET']

        sign = hashlib.md5(f"{api_key}{secret}".encode()).hexdigest()

        endpoints = {
            'inn': f"https://api.checkko.ru/v2/egrul?api_key={api_key}&sign={sign}&inn={query}",
            'auto': f"https://api.checkko.ru/v2/auto?api_key={api_key}&sign={sign}&grz={query}",
            'address': f"https://api.checkko.ru/v2/address?api_key={api_key}&sign={sign}&q={query}",
            'phone': f"https://api.checkko.ru/v2/phone?api_key={api_key}&sign={sign}&phone={query}",
            'name': f"https://api.checkko.ru/v2/person?api_key={api_key}&sign={sign}&fio={query}",
            'passport': f"https://api.checkko.ru/v2/passport?api_key={api_key}&sign={sign}&passport={query}",
        }

        url = endpoints.get(search_type)
        if not url:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неизвестный тип поиска'})}

        resp = requests.get(url, timeout=15)
        data = resp.json()

        if data.get('status') == 'error' or not data.get('data'):
            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({'error': data.get('message', 'Данные не найдены')})
            }

        result = format_result(search_type, data.get('data', {}))
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'result': result}, ensure_ascii=False)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors,
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }


def format_result(search_type: str, data: dict) -> str:
    lines = []

    if search_type == 'inn':
        org = data if not isinstance(data, list) else (data[0] if data else {})
        lines.append(f"Организация: {org.get('name', '—')}")
        lines.append(f"ИНН: {org.get('inn', '—')}")
        lines.append(f"ОГРН: {org.get('ogrn', '—')}")
        lines.append(f"Адрес: {org.get('address', '—')}")
        lines.append(f"Статус: {org.get('status', '—')}")
        lines.append(f"Руководитель: {org.get('director', {}).get('fio', '—') if isinstance(org.get('director'), dict) else org.get('director', '—')}")

    elif search_type == 'auto':
        v = data if not isinstance(data, list) else (data[0] if data else {})
        lines.append(f"Марка / Модель: {v.get('brand', '—')} {v.get('model', '—')}")
        lines.append(f"Год выпуска: {v.get('year', '—')}")
        lines.append(f"VIN: {v.get('vin', '—')}")
        lines.append(f"Цвет: {v.get('color', '—')}")
        lines.append(f"Регион: {v.get('region', '—')}")
        lines.append(f"Ограничения: {v.get('restrictions', '—')}")

    elif search_type == 'phone':
        p = data if not isinstance(data, list) else (data[0] if data else {})
        lines.append(f"Оператор: {p.get('operator', '—')}")
        lines.append(f"Регион: {p.get('region', '—')}")
        lines.append(f"Тип: {p.get('type', '—')}")

    elif search_type == 'name':
        persons = data if isinstance(data, list) else [data]
        for i, p in enumerate(persons[:3], 1):
            lines.append(f"[{i}] {p.get('fio', '—')}")
            lines.append(f"    Дата рождения: {p.get('birthday', '—')}")
            lines.append(f"    Регион: {p.get('region', '—')}")

    else:
        if isinstance(data, dict):
            for k, v in list(data.items())[:12]:
                if v:
                    lines.append(f"{k}: {v}")
        elif isinstance(data, list):
            for item in data[:3]:
                if isinstance(item, dict):
                    for k, v in list(item.items())[:6]:
                        if v:
                            lines.append(f"{k}: {v}")
                    lines.append("---")

    return "\n".join(lines) if lines else "Данные не найдены"
