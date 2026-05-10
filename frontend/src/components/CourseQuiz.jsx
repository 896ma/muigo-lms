import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api.js';

export default function CourseQuiz({ courseId, onClose }) {
  const [phase, setPhase] = useState('loading'); // loading | quiz | result | error
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/courses/${courseId}/quiz`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.questions) {
          setQuestions(data.questions);
          setPhase('quiz');
        } else {
          setErrorMsg(data.message || 'No quiz available.');
          setPhase('error');
        }
      })
      .catch(() => {
        setErrorMsg('Failed to load quiz. Please try again.');
        setPhase('error');
      });
  }, [courseId]);

  const handleSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data);
      setPhase('result');
    } catch {
      setErrorMsg('Failed to submit quiz. Please try again.');
      setPhase('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Course Quiz</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          {/* Loading */}
          {phase === 'loading' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jungle-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading quiz…</p>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{errorMsg}</p>
              <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Close</button>
            </div>
          )}

          {/* Quiz */}
          {phase === 'quiz' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">{questions.length} questions · Pass mark: 70%</p>
              {questions.map((q, qi) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800 mb-3">
                    <span className="text-jungle-600 mr-2">{qi + 1}.</span>{q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                          answers[q.id] === oi
                            ? 'border-jungle-500 bg-jungle-50'
                            : 'border-gray-200 hover:border-jungle-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={oi}
                          checked={answers[q.id] === oi}
                          onChange={() => handleSelect(q.id, oi)}
                          className="accent-jungle-500"
                        />
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-jungle-500 text-white font-bold rounded-xl hover:bg-jungle-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Quiz'}
              </button>
            </div>
          )}

          {/* Result */}
          {phase === 'result' && result && (
            <div className="space-y-6">
              {/* Score banner */}
              <div className={`rounded-xl p-6 text-center ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="text-5xl font-bold mb-2" style={{ color: result.passed ? '#16a34a' : '#dc2626' }}>
                  {result.score}%
                </div>
                <p className="text-lg font-semibold" style={{ color: result.passed ? '#15803d' : '#b91c1c' }}>
                  {result.passed ? '🎉 Congratulations! You passed!' : '❌ You did not pass. Review the answers below.'}
                </p>
                <p className="text-sm mt-1 text-gray-600">
                  {result.correct} / {result.total} correct · Pass mark: 70%
                </p>
              </div>

              {/* Answer review */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Answer Review</h3>
                {result.results.map((r, i) => (
                  <div
                    key={r.id}
                    className={`rounded-xl border p-4 ${r.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <p className="font-medium text-gray-800 mb-2">
                      <span className="mr-2">{r.isCorrect ? '✅' : '❌'}</span>
                      <span className="text-gray-500 mr-1">{i + 1}.</span>
                      {r.question}
                    </p>
                    <div className="space-y-1 ml-6">
                      {r.options.map((opt, oi) => {
                        const isCorrect = oi === r.correctAnswer;
                        const isUser = oi === r.userAnswer;
                        let cls = 'text-gray-600';
                        if (isCorrect) cls = 'text-green-700 font-semibold';
                        else if (isUser && !r.isCorrect) cls = 'text-red-600 line-through';
                        return (
                          <p key={oi} className={`text-sm ${cls}`}>
                            {isCorrect ? '✓ ' : isUser && !r.isCorrect ? '✗ ' : '  '}{opt}
                          </p>
                        );
                      })}
                    </div>
                    {!r.isCorrect && (
                      <p className="mt-2 ml-6 text-sm text-green-700 font-medium">
                        Correct answer: {r.options[r.correctAnswer]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {!result.passed && (
                  <button
                    onClick={() => { setAnswers({}); setPhase('quiz'); setResult(null); }}
                    className="flex-1 py-3 bg-jungle-500 text-white font-bold rounded-xl hover:bg-jungle-600 transition-colors"
                  >
                    Retake Quiz
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
