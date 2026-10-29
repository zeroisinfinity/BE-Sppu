
#include <iostream>
#include <string>
#include <ctime>
#include <iomanip>
using namespace std;

// Naive String Matching
void naiveSearch(string text, string pattern) {
    int n = text.length();
    int m = pattern.length();
    bool found = false;

    for (int i = 0; i <= n - m; i++) {
        int j;
        for (j = 0; j < m; j++) {
            if (text[i + j] != pattern[j])
                break;
        }

        if (j == m) {
            cout << "Pattern found at index " << i << endl;
            found = true;
        }
    }

    if (!found)
        cout << "Pattern not found" << endl;
}

// Rabin-Karp Algorithm
void rabinKarp(string text, string pattern) {
    int n = text.length();
    int m = pattern.length();

    const int d = 256;
    const int q = 101;
    int h = 1, p = 0, t = 0;
    bool found = false;

    for (int i = 0; i < m - 1; i++)
        h = (h * d) % q;

    for (int i = 0; i < m; i++) {
        p = (d * p + (unsigned char)pattern[i]) % q;
        t = (d * t + (unsigned char)text[i]) % q;
    }

    for (int i = 0; i <= n - m; i++) {
        if (p == t) {
            int j;
            for (j = 0; j < m; j++) {
                if (text[i + j] != pattern[j])
                    break;
            }

            if (j == m) {
                cout << "Pattern found at index " << i << endl;
                found = true;
            }
        }

        if (i < n - m) {
            t = (d * (t - (unsigned char)text[i] * h)
                 + (unsigned char)text[i + m]) % q;

            if (t < 0)
                t += q;
        }
    }

    if (!found)
        cout << "Pattern not found" << endl;
}

int main() {
    string text, pattern;

    cout << "Enter text: ";
    getline(cin, text);

    cout << "Enter pattern: ";
    getline(cin, pattern);

    if (pattern.empty()) {
        cout << "Pattern cannot be empty." << endl;
        return 0;
    }

    if (pattern.length() > text.length()) {
        cout << "Pattern not found." << endl;
        return 0;
    }

    clock_t start, end;
    double naiveTime, rkTime;

    cout << "\n--- Naive String Matching ---" << endl;
    start = clock();
    naiveSearch(text, pattern);
    end = clock();
    naiveTime = double(end - start) / CLOCKS_PER_SEC;

    cout << "Execution time: " << scientific
         << setprecision(0) << naiveTime
         << " seconds" << endl;

    cout << "\n--- Rabin-Karp Algorithm ---" << endl;
    start = clock();
    rabinKarp(text, pattern);
    end = clock();
    rkTime = double(end - start) / CLOCKS_PER_SEC;

    cout << "Execution time: " << scientific
         << setprecision(0) << rkTime
         << " seconds" << endl;

    cout << "\n--- Performance Comparison ---" << endl;
    cout << "Naive Time: " << naiveTime << endl;
    cout << "Rabin-Karp Time: " << rkTime << endl;

    return 0;
}

