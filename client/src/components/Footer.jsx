import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">S</div>
            <p className="font-bold text-slate-900">AI StudyBuddy</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
            An AI-powered learning assistance platform that turns study material into summaries, flashcards,
            quizzes and personalised study plans.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">Features</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>AI Summary Generation</li>
            <li>Active Recall Flashcards</li>
            <li>MCQ Quiz Generator</li>
            <li>Personalised Study Plans</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">Project</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>
              Developed by{' '}
              <span className="font-semibold text-slate-700">Hasim Rizvi</span>
            </li>
            <li>B.Sc. Computer Science - 3rd Year</li>
            <li>Mohamed Sathak College of Arts and Science</li>
            <li>
              <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                Student login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} AI StudyBuddy · Full Stack Project · React · Node.js · Express · MongoDB · Google Gemini
      </div>
    </footer>
  );
}
