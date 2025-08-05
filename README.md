# 🌟 el-professor

**el-professor** is an open-source project designed to simplify and automate complex tasks using intelligent agents and robust tools. it’s ideal for developers, researchers, and AI enthusiasts looking for customizable automation.

---

## 🚀 Features

- **Intelligent Agents**: Build custom agents with `mcp_agent` and `tracker`.
- **Flexible Configuration**: Manage your settings easily via JSON files in the `configs` folder.
- **Powerful Utilities**: Utilize modules like `loader` and `logger` for efficient data handling and logging.

---

## 📂 Project Structure
```
el-professor/
├── agent/
├──── init.py
├──── mcp_agent.py
├──── tracker.py
├── configs/
├──── init.py
├──── gemini_model.json
├──── mcp_server.json
├── static/
├──── styrene/
├──── Styrene_B_Family/
├──── tiempos/
├──── FiraCode-VF.ttf
├── utils/
├──── init.py
├──── loader.py
├──── logger.py
├── el_professor.py
├── el_professor_ui.py
├── .env
└── README.md
```
---

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pierrehanne/el-professor.git
   cd el-professor

2. Install dependencies:
   ```bash
    poetry install

3. Set up your environment variables:
   - Create a `.env` file in the root directory.
   - Add your environment variables (e.g., API keys, configurations).

---

## 🧑‍💻 Usage

1. Configure your JSON files inside the configs/ directory.
2. Configure a .env file with your environment variables.
3. Active the FastAPI Server:
   ```bash
   uvicorn el_professor:app --reload
    ```
4. Access the API at `http://localhost:8000/docs`.
5. Start the streamlit application
    ```bash
    streamlit run el_professor_ui.py
     ```
--- 

🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Submit a Pull Request.

---

📜 License
This project is licensed under the MIT License.

---

💡 Join the revolution with el-professor!

