import pandas as pd
import json
import re
import math

# имя файла Excel
EXCEL_FILE = "products.xlsx"
SHEET_NAME = "Для сайта"
OUTPUT_JSON = "products.json"


def extract_image_urls(html_content):
    """Извлекает URL изображений из HTML-строки."""
    if pd.isna(html_content):
        return []

    # Используем регулярное выражение для поиска всех URL в атрибуте src
    pattern = r'<img[^>]*src="([^"]*)"[^>]*>'
    matches = re.findall(pattern, html_content)
    return matches


def generate_slug(name):
    """Генерирует slug из названия товара."""
    slug = name.lower()
    # Заменяем все не-буквы и не-цифры на дефисы
    slug = re.sub(r'[^\w\s-]', '', slug)
    # Заменяем пробелы и множественные дефисы на одиночные дефисы
    slug = re.sub(r'[-\s]+', '-', slug)
    # Обрезаем дефисы в начале и конце
    return slug.strip('-')


def clean_nan_values(value):
    """Заменяет NaN значения на None."""
    if pd.isna(value):
        return None
    return value


def normalize_width(value):
    """Нормализует значение ширины."""
    if pd.isna(value):
        return None

    # Если значение содержит дюймы и мм в скобках, берем только мм
    if isinstance(value, str) and "(" in value and ")" in value:
        match = re.search(r'\((\d+)\)', value)
        if match:
            return int(match.group(1))

    # Пытаемся преобразовать в число
    try:
        return float(value) if "." in str(value) else int(value)
    except (ValueError, TypeError):
        return str(value)


def excel_to_json(excel_file_path, output_json_path):
    """Читает Excel-файл и преобразует его в JSON."""
    df = pd.read_excel(excel_file_path, sheet_name=SHEET_NAME)

    # Создаем список для хранения данных о товарах
    products = []

    # Проходим по каждой строке в DataFrame
    for index, row in df.iterrows():
        # Извлекаем URL изображений из HTML
        image_urls = extract_image_urls(row['Изображения'])

        # Создаем словарь с данными о товаре
        product = {
            "id": index + 1,
            "name": clean_nan_values(row['Полное наименование']),
            "slug": generate_slug(str(row['Полное наименование'])),
            "category": clean_nan_values(row['Тип']),
            "subcategory": clean_nan_values(row['Ось']),
            "brand": clean_nan_values(row['Бренд']),
            "model": clean_nan_values(row['Модель']),
            "width": normalize_width(row['Ширина профиля']),
            "height": clean_nan_values(row['Высота профиля']),
            "diameter": clean_nan_values(row['Диаметр']),
            "load_index": clean_nan_values(row['Индекс нагрузки / скорости']),
            "price": clean_nan_values(row['Цена']),
            "description": clean_nan_values(row['Описание']),
            "seoKeywords": clean_nan_values(row['SEO']),
            "images": image_urls,
            "specs": {
                "width": normalize_width(row['Ширина профиля']),
                "height": clean_nan_values(row['Высота профиля']),
                "diameter": clean_nan_values(row['Диаметр']),
                "load_index": clean_nan_values(row['Индекс нагрузки / скорости']),
                "type": clean_nan_values(row['Тип']),
                "axis": clean_nan_values(row['Ось'])
            }
        }

        # Удаляем поле oldPrice если оно всегда null
        if 'oldPrice' in product:
            del product['oldPrice']

        products.append(product)

    # Сохраняем в JSON файл
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"Успешно преобразовано {len(products)} товаров в {output_json_path}")


# Использование
if __name__ == "__main__":
    excel_to_json(EXCEL_FILE, OUTPUT_JSON)