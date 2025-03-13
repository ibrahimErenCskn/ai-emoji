# AI Emoji Predictor

AI Emoji Predictor is a fun, interactive web application that uses artificial intelligence to predict the most appropriate emoji based on user input. The application learns from user feedback to improve its predictions over time.

## Features

- 🤖 AI-powered emoji prediction using OpenAI's API
- 🎨 Clean, minimal, and user-friendly interface
- 📊 Feedback system to improve predictions
- 📱 Responsive design for all devices
- 🔒 Client-side only (no backend required)
- 📜 History tracking of past predictions and feedback

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- An OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-emoji.git
   cd ai-emoji
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using the App

1. Enter your OpenAI API key when prompted (it will be stored in your browser's localStorage)
2. Type a word, phrase, or emotion in the input field
3. Click "Predict" to get an emoji prediction
4. Provide feedback on the prediction (thumbs up or down)
5. View your prediction history by clicking the history button

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- [OpenAI API](https://openai.com/) - AI model for emoji prediction

## Privacy

This application runs entirely in your browser. Your OpenAI API key and prediction history are stored in your browser's localStorage and are never sent to any server other than OpenAI's API for prediction purposes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API
- Next.js team for the amazing framework
- All contributors and users of this application
