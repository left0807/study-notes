# Study Notes Website

A simple web application to navigate and display study notes stored in Markdown format.

## Features

- Navigate through directories
- Display markdown files with syntax highlighting
- Dark theme with coding font style
- Simple and clean interface
- 24/7 operation with PM2 process manager
- Daily automatic sync from GitHub

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server (development):
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## How to Contribute

We welcome contributions! If you'd like to contribute to this project, please follow these steps:

1.  **Fork the repository**: Click the "Fork" button on the project's GitHub page to create your own copy of the repository.
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd your-blog
    ```
    (Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.)
3.  **Create a new branch**: For any new feature or bug fix, create a dedicated branch:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/your-bug-fix
    ```
4.  **Make your changes**: Implement your feature or fix the bug.
5.  **Test your changes**: Ensure your changes do not break existing functionality and add new tests if applicable.
6.  **Commit your changes**: Commit your changes with clear and concise messages.
    ```bash
    git add .
    git commit -m "feat: Add new feature X"
    # or
    git commit -m "fix: Resolve bug Y"
    ```
7.  **Push to your fork**:
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Create a Pull Request**: Open a Pull Request from your fork to the main repository. Describe your changes clearly.

## Usage

- Click on directories to navigate
- Click on markdown files to view their content
- Use the breadcrumb navigation to go back to parent directories

## Logs

- Application logs: `logs/out.log` and `logs/error.log`
- Sync logs: `sync.log` and `logs/cron.log`
