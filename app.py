from flask import Flask, render_template, request, send_file
import pandas as pd
import os
import joblib
from datetime import datetime

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    file_ready = False
    if request.method == 'POST':
        # Get uploaded files
        template_file = request.files.get('template_file')
        realtime_file = request.files.get('realtime_file')

        if template_file and realtime_file:
            # Load template data and train the model
            template_df = pd.read_excel(template_file)

            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.svm import SVC
            from sklearn.preprocessing import LabelEncoder
            from sklearn.pipeline import Pipeline

            X_template = template_df['Job Description']
            y_template = template_df['Job Title']

            label_encoder = LabelEncoder()
            y_encoded = label_encoder.fit_transform(y_template)

            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer()),
                ('clf', SVC(kernel='linear', probability=True))
            ])

            pipeline.fit(X_template, y_encoded)

            # Predict on real-time data
            real_df = pd.read_csv(realtime_file)
            predictions = pipeline.predict(real_df['Description'])
            real_df['BestJobRole'] = label_encoder.inverse_transform(predictions)

            # ✅ Generate output filename using up to second underscore
            realtime_filename = realtime_file.filename
            filename_wo_ext = os.path.splitext(realtime_filename)[0]
            parts = filename_wo_ext.split('_')

            if len(parts) >= 2:
                prefix = '_'.join(parts[:2])  # First and second parts
            else:
                prefix = parts[0]  # Fallback to just the first part

            today_str = datetime.now().strftime('%d-%m-%Y')
            output_filename = f'{prefix}_{today_str}.csv'
            output_path = os.path.join('resulted_data', output_filename)

            os.makedirs('resulted_data', exist_ok=True)
            real_df.to_csv(output_path, index=False, encoding='utf-8-sig')

            app.config['LAST_RESULT_PATH'] = output_path
            file_ready = True

    return render_template('index.html', file_ready=file_ready)

@app.route('/view-result')
def view_result():
    result_path = app.config.get('LAST_RESULT_PATH')
    if result_path and os.path.exists(result_path):
        return send_file(result_path, as_attachment=False)
    return "Result not available.", 404

import os

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # use Render's port if provided
    app.run(host='0.0.0.0', port=port, debug=True)
