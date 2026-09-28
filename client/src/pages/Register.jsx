import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const COLLEGE = 'Mohamed Sathak College of Arts and Science';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'B.Sc. Computer Science',
    year: '3rd Year',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        year: form.year,
        college: COLLEGE,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-brand-700 p-10 text-white md:flex">
          <div>
            <h2 className="text-2xl font-bold">Start studying smarter today</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-100">
              Join your classmates using AI StudyBuddy to convert lengthy notes into revision-ready material in
              seconds.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-brand-50">
            {[
              'Concise AI summaries of any topic',
              'Flashcards for active recall practice',
              'MCQ quizzes to test your understanding',
              'Study plans built around your exam date',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-brand-200">Project by Hasim Rizvi · {COLLEGE}</p>
        </div>

        <div className="p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Free for all students. Takes less than a minute.</p>

          <Alert type="error" onClose={() => setError('')}>{error}</Alert>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" name="name" className="input" value={form.name} onChange={handleChange} placeholder="e.g. Hasim Rizvi" required />
            </div>

            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" className="input" value={form.email} onChange={handleChange} placeholder="you@college.edu" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" className="input" value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" required />
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" className="input" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="department">Department</label>
                <input id="department" name="department" className="input" value={form.department} onChange={handleChange} />
              </div>
              <div>
                <label className="label" htmlFor="year">Year of study</label>
                <select id="year" name="year" className="input" value={form.year} onChange={handleChange}>
                  {['1st Year', '2nd Year', '3rd Year'].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
