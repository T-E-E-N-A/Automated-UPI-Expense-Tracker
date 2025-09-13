import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib

# 1. Load dataset
df = pd.read_csv("upi_dataset.csv")

print(df)
print("Dataset shape:", df.shape)
print(df.head())

# 2. Train-test split
X = df["text"]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. Create model pipeline (TF-IDF + Naive Bayes)
model = make_pipeline(
    TfidfVectorizer(ngram_range=(1,2), stop_words="english"),
    MultinomialNB()
)

# 4. Train model
model.fit(X_train, y_train)

# 5. Evaluate model
y_pred = model.predict(X_test)
print("\n✅ Accuracy:", accuracy_score(y_test, y_pred))
print("\n📊 Classification Report:\n", classification_report(y_test, y_pred))

# 6. Save model
joblib.dump(model, "upi_sms_model.pkl")
print("\n💾 Model saved as upi_sms_model.pkl")
