export interface DrillOption {
  id: 'safe' | 'risky';
  text: string;
  isCorrect: boolean;
}

export interface DrillScenario {
  id: string;
  tag: string;
  question: string;
  options: DrillOption[];
  explanationEn: string;
  explanationPidgin: string;
}

export const DRILL_SCENARIOS: DrillScenario[] = [
  {
    id: 'whatsapp-pin',
    tag: 'WhatsApp Hijack Defense',
    question: 'An acquaintance on WhatsApp messages you: "Sorry, I accidentally sent my 6-digit verification code to your SMS! Please send it back to me quickly."',
    options: [
      { id: 'risky', text: 'Send them the code to help out', isCorrect: false },
      { id: 'safe', text: 'Never send the code. It is a trap', isCorrect: true },
    ],
    explanationEn: 'That 6-digit code is YOUR OWN WhatsApp registration code! Sharing it immediately hands over your WhatsApp account to the scammer.',
    explanationPidgin: 'Dat 6-digit code na YOUR OWN WhatsApp account key! If you send am, dem go take over your WhatsApp sharp sharp.',
  },
  {
    id: 'marketplace-pop',
    tag: 'Fake Receipt Defense',
    question: 'A marketplace buyer sends an official-looking Bank Proof of Payment (PoP) screenshot. A courier is knocking outside your door demanding immediate release of the goods.',
    options: [
      { id: 'risky', text: 'Release the goods based on the screenshot', isCorrect: false },
      { id: 'safe', text: 'Hold goods until money reflects in your own app', isCorrect: true },
    ],
    explanationEn: 'Scammers frequently generate fake bank receipts or fake credit SMS. Never release goods until cleared funds reflect in your official bank app.',
    explanationPidgin: 'Scammers dey edit screenshot pass photographer! Make you no release any item until money enter your own bank app well well.',
  },
  {
    id: 'mpesa-reversal',
    tag: 'M-Pesa / Mobile Money Trap',
    question: 'You receive an SMS saying money was mistakenly credited to your line. An unknown caller cries on the phone begging you to dial your wallet PIN to reverse it right now.',
    options: [
      { id: 'risky', text: 'Dial PIN and send the money back', isCorrect: false },
      { id: 'safe', text: 'Refuse; tell them to contact Safaricom/MTN', isCorrect: true },
    ],
    explanationEn: 'Dialing your secret PIN sends YOUR own cash! Legitimate reversals are handled by telco customer service without you having to transfer money.',
    explanationPidgin: 'If you dial your PIN, na YOUR money you dey send! Tell dem make dem call Safaricom or MTN customer care.',
  },
  {
    id: 'social-vendor-pod',
    tag: 'Social Commerce Shield',
    question: 'An Instagram vendor with 40,000 followers offers a new iPhone at 70% discount: "Strictly payment before delivery, no pay on delivery, offer closes in 1 hour."',
    options: [
      { id: 'risky', text: 'Pay immediately to lock in the discount', isCorrect: false },
      { id: 'safe', text: 'Demand Trust Seal or Payment on Delivery', isCorrect: true },
    ],
    explanationEn: 'Extreme discounts combined with artificial urgency and refusal of payment-on-delivery is the classic social commerce advance-fee trap.',
    explanationPidgin: 'Too-good-to-be-true discount plus rush-rush na pure format. If vendor refuse escrow or POD, waka pass.',
  },
];
