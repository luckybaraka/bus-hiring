import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { paymentService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Copy,
  CheckCircle2,
  Info,
  ArrowLeft,
  Lock,
  Zap,
} from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const { pendingBooking, selectedTrip, selectedSeat, setConfirmedBooking } = useBooking();

  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [validationHints, setValidationHints] = useState([]);
  const [shake, setShake] = useState(false);

  const DEMO_CODE = 'QHJ2XKTYP1';
  const TILL_NUMBER = '247247';

  useEffect(() => {
    if (!pendingBooking) {
      navigate('/');
    }
  }, [pendingBooking, navigate]);

  const copyDemoCode = () => {
    setMpesaCode(DEMO_CODE);
    setCodeCopied(true);
    toast.success('Demo code pasted into the field!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const validateCodeLive = (code) => {
    const hints = [];
    if (code.length === 0) return [];

    if (code.length < 10) hints.push({ ok: false, text: `${10 - code.length} more characters needed` });
    if (code.length > 10) hints.push({ ok: false, text: 'Code is too long (max 10 characters)' });
    if (code.length === 10) hints.push({ ok: true, text: 'Correct length (10 characters)' });

    if (!/^[A-Z]/.test(code.toUpperCase()) || !/^[A-Za-z]/.test(code))
      hints.push({ ok: false, text: 'Must start with a letter' });
    else
      hints.push({ ok: true, text: 'Starts with a letter ✓' });

    if (/[^A-Z0-9]/i.test(code))
      hints.push({ ok: false, text: 'Only letters and numbers allowed' });
    else if (code.length > 0)
      hints.push({ ok: true, text: 'Valid characters ✓' });

    const digits = (code.match(/\d/g) || []).length;
    if (digits < 2)
      hints.push({ ok: false, text: `Need at least 2 digits (you have ${digits})` });
    else
      hints.push({ ok: true, text: `${digits} digits present ✓` });

    const letters = (code.match(/[A-Za-z]/g) || []).length;
    if (letters < 4)
      hints.push({ ok: false, text: `Need at least 4 letters (you have ${letters})` });
    else
      hints.push({ ok: true, text: `${letters} letters present ✓` });

    return hints;
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setMpesaCode(val);
    setError('');
    setValidationHints(validateCodeLive(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pendingBooking) return;

    setLoading(true);
    setError('');

    try {
      const result = await paymentService.validate(
        pendingBooking.booking_reference,
        mpesaCode
      );
      setConfirmedBooking(result.data);
      toast.success('Payment confirmed! 🎉');
      navigate('/confirmation');
    } catch (err) {
      setError(err.message || 'Payment validation failed. Please check your MPESA code.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  if (!pendingBooking) return null;

  const amount = selectedTrip?.price || pendingBooking?.amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10">
      <div className="max-w-xl mx-auto px-4">

        {/* Back button */}
        <button
          onClick={() => navigate('/receipt-preview')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Receipt Preview
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Smartphone size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-800">M-PESA Payment</h1>
          <p className="text-gray-500 mt-2">Complete your booking by paying via M-PESA</p>
        </div>

        {/* Amount Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-xl animate-fade-up">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-200 text-sm uppercase tracking-wider font-medium">Amount Due</p>
              <p className="text-4xl font-bold mt-1">KES {Number(amount).toLocaleString()}</p>
              <p className="text-green-200 text-sm mt-2">
                Booking Ref: <span className="text-white font-mono font-bold">{pendingBooking.booking_reference}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-green-200 text-sm uppercase tracking-wider font-medium">Pay To</p>
              <p className="text-2xl font-bold font-mono mt-1">{TILL_NUMBER}</p>
              <p className="text-green-200 text-xs mt-1">M-PESA Till Number</p>
            </div>
          </div>
        </div>

        {/* MPESA Instructions */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100 animate-fade-up">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-green-600" />
            How to Pay via M-PESA
          </h3>
          <ol className="space-y-3">
            {[
              { step: 1, text: `Go to M-PESA on your phone` },
              { step: 2, text: `Select "Lipa na M-PESA"` },
              { step: 3, text: `Select "Buy Goods and Services"` },
              { step: 4, text: `Enter Till Number: ${TILL_NUMBER}` },
              { step: 5, text: `Enter Amount: KES ${Number(amount).toLocaleString()}` },
              { step: 6, text: `Enter your M-PESA PIN and confirm` },
              { step: 7, text: `Copy the confirmation code from the SMS` },
              { step: 8, text: `Paste the code below to confirm your booking` },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
                <span className="text-gray-600 text-sm">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Demo Hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Zap size={16} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800 text-sm mb-1">🎓 Training / Demo Mode</p>
              <p className="text-amber-700 text-sm mb-3">
                This is a demo system. Use the code below to simulate a successful M-PESA payment.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white border-2 border-amber-300 rounded-lg px-4 py-2 font-mono font-bold text-lg text-center text-amber-900 tracking-widest">
                  {DEMO_CODE}
                </div>
                <button
                  onClick={copyDemoCode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    codeCopied
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                  }`}
                >
                  {codeCopied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  {codeCopied ? 'Used!' : 'Use Code'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="animate-fade-up">
          <div className={`bg-white rounded-2xl shadow-md p-6 border border-gray-100 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" />
              Enter M-PESA Confirmation Code
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                M-PESA Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={mpesaCode}
                onChange={handleCodeChange}
                placeholder="e.g. QHJ2XKTYP1"
                maxLength={10}
                className={`w-full border-2 rounded-xl px-4 py-4 text-center font-mono text-xl tracking-[0.3em] font-bold uppercase transition-all outline-none ${
                  error
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : mpesaCode.length === 10
                    ? 'border-green-400 bg-green-50 focus:border-green-500'
                    : 'border-gray-200 focus:border-green-400'
                }`}
              />
              {/* Character counter */}
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">Enter the 10-character code from your M-PESA SMS</p>
                <p className={`text-xs font-mono font-bold ${mpesaCode.length === 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  {mpesaCode.length}/10
                </p>
              </div>
            </div>

            {/* Live Validation Hints */}
            {validationHints.length > 0 && (
              <div className="mb-4 space-y-1.5">
                {validationHints.map((hint, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${hint.ok ? 'text-green-600' : 'text-red-500'}`}>
                    {hint.ok ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span>{hint.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
              <Lock size={12} />
              <span>Your payment is secured and encrypted. Code is validated against M-PESA records.</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || mpesaCode.length !== 10}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                loading || mpesaCode.length !== 10
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Validating Payment...
                </>
              ) : (
                <>
                  <ShieldCheck size={22} />
                  Confirm Payment & Book
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Note */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 px-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <p>
            After validation, you will receive a confirmation email with your full booking receipt. 
            Please ensure your email address is correct.
          </p>
        </div>
      </div>
    </div>
  );
}
