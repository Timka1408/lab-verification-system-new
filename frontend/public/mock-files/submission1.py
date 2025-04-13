#!/usr/bin/env python
# -*- coding: utf-8 -*-

def bubble_sort(arr):
    """
    Реализация алгоритма сортировки пузырьком
    """
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def main():
    # Пример использования
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print("Исходный массив:")
    print(test_array)
    
    sorted_array = bubble_sort(test_array)
    print("Отсортированный массив:")
    print(sorted_array)

if __name__ == "__main__":
    main()
