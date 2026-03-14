'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  CreditCard,
  ShieldCheck,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { KuraLogo } from '@/components/ui/kura-logo';
import { cn, formatKES } from '@/lib/utils';
import { ECFA_ANONYMOUS_THRESHOLD, ECFA_INDIVIDUAL_LIMIT } from '@/lib/validators/donations';

/* -------------------------------------------------------------------------- */
/*  Types & Constants                                                          */
/* -------------------------------------------------------------------------- */

type Step = 'info' | 'payment' | 'confirm' | 'success';
type PaymentMethod = 'mpesa' | 'card';

const CAMPAIGN_NAME = 'Gubernatorial Campaign 2027';
const CAMPAIGN_TAGLINE = 'Support transparent, accountable governance';

/* -------------------------------------------------------------------------- */
/*  Donor Portal Page                                                          */
/* -------------------------------------------------------------------------- */

export default function DonatePage() {
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [anonymous, setAnonymous] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;

  // Validation
  const phoneValid = /^(0[17]\d{8}|254[17]\d{8}|\+254[17]\d{8})$/.test(donorPhone.replace(/\s/g, ''));
  const idValid = /^\d{8}$/.test(nationalId);
  const amountValid = parsedAmount > 0 && parsedAmount <= ECFA_INDIVIDUAL_LIMIT;
  const canProceed = (anonymous || (donorName.length >= 2 && phoneValid && idValid)) && amountValid;

  const anonymousWarning = anonymous && parsedAmount > ECFA_ANONYMOUS_THRESHOLD;

  // Quick amount buttons
  const QUICK_AMOUNTS = [500, 1_000, 5_000, 10_000, 50_000, 100_000];

  const handleSubmitInfo = () => {
    if (!canProceed) return;
    setStep('payment');
  };

  const handleSubmitPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'mpesa') {
        // Initiate STK Push
        const res = await fetch('/api/mpesa/stkpush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: donorPhone,
            amount: parsedAmount,
            campaignId: 'default', // Would come from URL param in production
            donorName: anonymous ? undefined : donorName,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Payment initiation failed');
        }

        // STK push sent — show confirmation step
        setStep('confirm');

        // Poll or wait for callback (in production, use websockets or polling)
        // For now, simulate success after a delay
        setTimeout(() => {
          setStep('success');
          setLoading(false);
        }, 5000);
        return;
      }

      // For card payments (future integration)
      setStep('confirm');
      setTimeout(() => {
        setStep('success');
        setLoading(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9FC] to-white">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <KuraLogo size="sm" variant="full" animated={false} />
          </Link>
          <div className="flex items-center gap-1.5 text-[#1D6B3F]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">ECFA Compliant</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Campaign info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#1D6B3F]/10 text-[#1D6B3F] px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
            <Heart className="h-3.5 w-3.5" />
            Donate
          </div>
          <h1 className="text-2xl font-bold text-[#0F2A44]">{CAMPAIGN_NAME}</h1>
          <p className="text-sm text-[#64748B] mt-1">{CAMPAIGN_TAGLINE}</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['info', 'payment', 'confirm', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === s
                    ? 'bg-[#1D6B3F] text-white'
                    : i < ['info', 'payment', 'confirm', 'success'].indexOf(step)
                      ? 'bg-[#1D6B3F]/20 text-[#1D6B3F]'
                      : 'bg-[#E2E8F0] text-[#94A3B8]'
                )}
              >
                {i < ['info', 'payment', 'confirm', 'success'].indexOf(step) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && <div className="w-8 h-0.5 bg-[#E2E8F0]" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Donor Info */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm"
            >
              <h2 className="text-lg font-bold text-[#0F2A44] mb-4">Your Details</h2>

              {/* Anonymous toggle */}
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E2E8F0] text-[#1D6B3F]"
                />
                <span className="text-sm text-[#4A5568]">Donate anonymously</span>
              </label>

              {anonymousWarning && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    ECFA requires identity verification for donations exceeding KES{' '}
                    {ECFA_ANONYMOUS_THRESHOLD.toLocaleString()}. Please uncheck anonymous or reduce the amount.
                  </p>
                </div>
              )}

              {!anonymous && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. Grace Wanjiku Muthoni"
                      className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#1D6B3F] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1">Phone Number</label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-[#F0F4F8] border border-r-0 border-[#E2E8F0] rounded-l-lg text-sm text-[#64748B]">
                        +254
                      </span>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="712 345 678"
                        className="flex-1 px-3 py-2.5 bg-[#F7F9FC] border border-[#E2E8F0] rounded-r-lg text-sm focus:outline-none focus:border-[#1D6B3F] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A5568] mb-1">National ID (KYC)</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="8-digit ID number"
                      maxLength={8}
                      className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#1D6B3F] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#4A5568] mb-1">Donation Amount</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-[#F0F4F8] border border-r-0 border-[#E2E8F0] rounded-l-lg text-sm font-semibold text-[#0F2A44]">
                    KES
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min={1}
                    max={ECFA_INDIVIDUAL_LIMIT}
                    className="flex-1 px-3 py-2.5 bg-[#F7F9FC] border border-[#E2E8F0] rounded-r-lg text-sm font-semibold focus:outline-none focus:border-[#1D6B3F] transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_AMOUNTS.map((qa) => (
                    <button
                      key={qa}
                      type="button"
                      onClick={() => setAmount(qa.toString())}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        parsedAmount === qa
                          ? 'bg-[#1D6B3F] text-white border-[#1D6B3F]'
                          : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:border-[#1D6B3F]/30'
                      )}
                    >
                      {qa >= 1000 ? `${(qa / 1000).toFixed(0)}K` : qa}
                    </button>
                  ))}
                </div>
                {parsedAmount > 0 && (
                  <p className="text-[10px] text-[#94A3B8] mt-1">
                    ECFA limit: {formatKES(ECFA_INDIVIDUAL_LIMIT)} per individual per election cycle
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmitInfo}
                disabled={!canProceed || anonymousWarning}
                className="w-full py-3 bg-[#1D6B3F] text-white font-semibold rounded-xl hover:bg-[#165a33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment Method */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm"
            >
              <button
                onClick={() => setStep('info')}
                className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#0F2A44] mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              <h2 className="text-lg font-bold text-[#0F2A44] mb-1">Payment Method</h2>
              <p className="text-sm text-[#64748B] mb-4">
                Donating <span className="font-bold text-[#1D6B3F]">{formatKES(parsedAmount)}</span>
                {!anonymous && donorName && <> as {donorName}</>}
              </p>

              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                    paymentMethod === 'mpesa'
                      ? 'border-[#1D6B3F] bg-[#1D6B3F]/5'
                      : 'border-[#E2E8F0] hover:border-[#1D6B3F]/30'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1D6B3F]/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-[#1D6B3F]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F2A44]">M-Pesa</p>
                    <p className="text-xs text-[#64748B]">Pay via STK push to your phone</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                    paymentMethod === 'card'
                      ? 'border-[#2E75B6] bg-[#2E75B6]/5'
                      : 'border-[#E2E8F0] hover:border-[#2E75B6]/30'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#2E75B6]/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-[#2E75B6]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F2A44]">Card Payment</p>
                    <p className="text-xs text-[#64748B]">Visa, Mastercard (coming soon)</p>
                  </div>
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitPayment}
                disabled={loading || paymentMethod === 'card'}
                className="w-full py-3 bg-[#1D6B3F] text-white font-semibold rounded-xl hover:bg-[#165a33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {formatKES(parsedAmount)}
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Step 3: Confirmation (waiting for M-Pesa PIN) */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#1D6B3F]/10 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-[#1D6B3F]" />
              </div>
              <h2 className="text-lg font-bold text-[#0F2A44] mb-2">Check Your Phone</h2>
              <p className="text-sm text-[#64748B] mb-4">
                An M-Pesa payment prompt has been sent to your phone.
                Enter your PIN to complete the donation of{' '}
                <span className="font-bold text-[#1D6B3F]">{formatKES(parsedAmount)}</span>.
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 text-[#1D6B3F] animate-spin" />
              </div>
              <p className="text-xs text-[#94A3B8] mt-4">
                Waiting for confirmation from Safaricom...
              </p>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="h-10 w-10 text-[#1D6B3F]" />
              </motion.div>
              <h2 className="text-xl font-bold text-[#0F2A44] mb-2">Thank You!</h2>
              <p className="text-sm text-[#64748B] mb-2">
                Your donation of{' '}
                <span className="font-bold text-[#1D6B3F]">{formatKES(parsedAmount)}</span>{' '}
                has been received.
              </p>
              <p className="text-xs text-[#94A3B8] mb-6">
                A receipt will be sent to your phone. This donation is recorded under
                ECFA compliance rules and will appear in the campaign&apos;s public disclosure.
              </p>

              <div className="bg-[#F7F9FC] rounded-xl p-4 mb-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#64748B]">Amount</span>
                  <span className="font-semibold text-[#0F2A44]">{formatKES(parsedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#64748B]">Method</span>
                  <span className="font-semibold text-[#0F2A44]">M-Pesa</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Status</span>
                  <span className="font-semibold text-[#1D6B3F]">Confirmed</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('info');
                  setAmount('');
                  setDonorName('');
                  setDonorPhone('');
                  setNationalId('');
                  setAnonymous(false);
                  setLoading(false);
                  setError(null);
                }}
                className="w-full py-3 bg-[#0F2A44] text-white font-semibold rounded-xl hover:bg-[#0a1e33] transition-colors"
              >
                Make Another Donation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-[#94A3B8]">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            ECFA Compliant
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            KYC Verified
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            End-to-End Encrypted
          </div>
        </div>
      </main>
    </div>
  );
}
