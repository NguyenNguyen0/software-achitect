from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, Docker Flask!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

# docker build -t flask-docker .
# docker run -p 5000:5000 flask-docker