import joblib

# Load trained model
model = joblib.load("upi_sms_model.pkl")

# Test samples
samples = [
    # 🛒 Shopping
    "Your a/c XXXX1234 debited by Rs.4500.00 on 10-Sep-25 to myntra@upi. Ref No 9876543211. Avl bal Rs. 12,400.00.",
    "Failed UPI transaction of Rs.2999.00 attempted at flipkart@upi on 05-Sep-25. Ref No 1234598765.",

    # 🍔 Food & Delivery
    "UPI transaction of Rs.560.00 made to Zomato on 11-Sep-25. Ref No 4567891230. Avl bal Rs. 8,250.00.",
    "Your a/c XXXX7788 debited by Rs.349.00 on 12-Sep-25 to swiggy@upi. Avl bal Rs. 22,000.00.",

    # 🚕 Transport
    "Rs.250.00 debited towards ola ride via UPI. Ref No 8765432109. Avl bal Rs. 15,200.00.",
    "Your UPI payment of Rs.199.00 to uber@upi was successful. Ref No 5647382910.",

    # 🎬 Entertainment / Subscriptions
    "UPI AutoPay: Rs.799.00 has been deducted towards Netflix subscription. Ref No 3344556677.",
    "Your UPI mandate of Rs.399.00 for Spotify Premium has been set up successfully. Ref No 6677889900.",
    "Rs.179.00 paid via UPI for Hotstar subscription. Ref No 1122445566.",

    # 📱 Bills & Recharge
    "Rs.299.00 paid via UPI for Airtel recharge. Ref No 9988776655.",
    "Your a/c XXXX5678 debited by Rs.600.00 on 13-Sep-25 for BESCOM electricity bill. Ref No 4433221100.",

    # 💸 Transfers Sent
    "You have sent Rs.5000.00 to father@upi via UPI. Ref No 7654321000. Date: 13-Sep-25. Avl bal Rs. 35,200.00.",
    "Your a/c XXXX2233 debited by Rs.2000.00 on 14-Sep-25 to friend@upi. Ref No 9988221100.",

    # 💰 Transfers Received
    "Rs.12000.00 credited to your a/c XXXX3456 from salary@upi. Ref No 1122339988. Avl bal Rs. 75,600.00.",
    "Rs.2200.00 credited from refund@upi to your account. Ref No 8877665544.",

    # ✈️ Travel & Booking
    "Your UPI transaction of Rs.1350.00 to IRCTC was successful. Ref No 5566778899.",
    "Rs.9000.00 paid via UPI to makemytrip@upi for flight booking. Ref No 1234432112.",
]

# Predict categories
predictions = model.predict(samples)

for text, label in zip(samples, predictions):
    print(f"\nSMS: {text}\nPredicted Category: {label}")

