# Titanic Survival Prediction

## Files
- `titanic_survival.py`: complete machine learning program
- `requirements.txt`: Python dependencies
- `titanic.csv`: downloaded automatically on first run, or provide your own Kaggle training CSV
- Three PNG charts are generated after execution

## Run
```bash
python -m pip install -r requirements.txt
python titanic_survival.py
```

The script uses six features: `Pclass`, `Sex`, `Age`, `Fare`, `Embarked`, and `FamilySize`.
It compares Logistic Regression, Decision Tree, and Random Forest and prints evaluation metrics.

**Important:** Exact scores can vary with dataset source, library versions, and preprocessing details. The report's figures are reference results, not guaranteed outputs from every environment.
