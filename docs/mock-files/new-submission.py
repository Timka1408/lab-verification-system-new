#!/usr/bin/env python
# -*- coding: utf-8 -*-

def is_prime(n):
    """
    Функция для проверки, является ли число простым
    """
    if n <= 1:
        return False
    if n <= 3:
        return True
    
    if n % 2 == 0 or n % 3 == 0:
        return False
    
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    
    return True

def get_primes_in_range(start, end):
    """
    Функция для получения всех простых чисел в заданном диапазоне
    """
    primes = []
    for num in range(start, end + 1):
        if is_prime(num):
            primes.append(num)
    return primes

def main():
    # Пример использования
    start = 10
    end = 50
    
    print(f"Простые числа в диапазоне от {start} до {end}:")
    primes = get_primes_in_range(start, end)
    print(primes)
    
    print(f"Всего найдено {len(primes)} простых чисел")

if __name__ == "__main__":
    main()
