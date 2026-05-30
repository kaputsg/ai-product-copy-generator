from flask import Flask, jsonify, request
from deepseek_text import generate_product_copy
from withLC import get_product_info

app = Flask(__name__)

@app.route("/api/generate", methods=['POST'])
def generate():
    # file = request.get_data()
    print("getting data")
    data = request.form
    file = request.files.get('file')
    prompt = data["prompt"]
    tone = data["tone"]
    language = data["language"]
    
    result = get_product_info(file.stream.read(), prompt, tone, language)
    # result = {
    #     "description":"This adorable enamel pin features a cat dressed as an assassin, complete with a sword and ninja outfit. Perfect for cat lovers and pin collectors alike.",
    #     "tags":["enamel pin","cat","assassin","cute","collectible","accessory"],
    #     "title":"Assassin Meowy Enamel Pin"
    # }
    return jsonify({'result': result})

@app.route("/api/generate-text", methods=['POST'])
def generate_text():
    data = request.get_json(silent=True) or {}
    product_name = data.get("product_name", "").strip()

    if not product_name:
        return jsonify({"error": "product_name 不能为空"}), 400

    try:
        result = generate_product_copy(
            product_name=product_name,
            product_info=data.get("product_info", ""),
            target_platform=data.get("target_platform", "淘宝/拼多多"),
            tone=data.get("tone", "专业、清晰、有购买欲"),
            language=data.get("language", "中文"),
        )
    except Exception as error:
        return jsonify({"error": str(error)}), 500

    return jsonify({"result": result})
