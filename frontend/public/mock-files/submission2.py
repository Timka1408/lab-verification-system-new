#!/usr/bin/env python
# -*- coding: utf-8 -*-

def find_max_min(arr):
    """
    Функция для нахождения максимального и минимального элементов в массиве
    """
    if not arr:
        return None, None
    
    max_val = min_val = arr[0]
    
    for num in arr:
        if num > max_val:
            max_val = num
        if num < min_val:
            min_val = num
    
    return max_val, min_val

def calculate_average(arr):
    """
    Функция для вычисления среднего значения элементов массива
    """
    if not arr:
        return 0
    
    total = sum(arr)
    return total / len(arr)

def main():
    # Пример использования
    numbers = [15, 7, 3, 9, 12, 6, 20, 4]
    print("Исходный массив:", numbers)
    
    max_val, min_val = find_max_min(numbers)
    print(f"Максимальное значение: {max_val}")
    print(f"Минимальное значение: {min_val}")
    
    avg = calculate_average(numbers)
    print(f"Среднее значение: {avg}")

if __name__ == "__main__":
    main()
