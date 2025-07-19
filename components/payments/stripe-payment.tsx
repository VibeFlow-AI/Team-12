"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard, 
  Lock, 
  Loader2, 
  Check, 
  AlertCircle,
  X 
} from "lucide-react";
import { toast } from "sonner";

interface StripePaymentProps {
  sessionId: string;
  amount: number;
  currency?: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
  sessionDetails: {
    mentorName: string;
    date: string;
    time: string;
    subject: string;
    duration: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: <CreditCard className="w-5 h-5" />,
    available: true
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: <div className="w-5 h-5 bg-blue-500 rounded"></div>,
    available: true
  }
];

export default function StripePayment({
  sessionId,
  amount,
  currency = "USD",
  onSuccess,
  onCancel,
  sessionDetails
}: StripePaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  
  // Bank transfer state
  const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);

  const createPaymentIntent = useCallback(async () => {
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: sessionId,
          amount: amount,
          currency: currency.toLowerCase(),
          paymentMethod: selectedMethod
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize payment");
    }
  }, [sessionId, amount]);

  useEffect(() => {
    createPaymentIntent();
  }, [createPaymentIntent]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleCardPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      setError("Please fill in all card details");
      return;
    }

    if (!clientSecret) {
      setError("Payment not initialized. Please try again.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // In a real implementation, you would use Stripe.js here
      // For now, we'll simulate the payment process
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const mockPaymentResult = {
        paymentIntent: {
          id: paymentIntentId,
          status: "succeeded"
        }
      };

      if (mockPaymentResult.paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess(mockPaymentResult.paymentIntent.id);
      } else {
        throw new Error("Payment failed");
      }

    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!bankSlipFile) {
      setError("Please upload your bank transfer slip");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Upload bank slip
      const formData = new FormData();
      formData.append('file', bankSlipFile);

      const uploadResponse = await fetch('/api/upload-bank-slip', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload bank slip");
      }

      const uploadData = await uploadResponse.json();
      
      // Update payment with bank slip URL
      const response = await fetch("/api/payments/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: paymentIntentId,
          status: "pending_verification",
          bankSlipUrl: uploadData.url
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment");
      }

      toast.success("Bank slip uploaded successfully! Payment is pending verification.");
      onSuccess("bank_transfer_" + paymentIntentId);

    } catch (err) {
      console.error("Bank transfer error:", err);
      setError(err instanceof Error ? err.message : "Bank transfer failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG) or PDF file.');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }

      setBankSlipFile(file);
      setError("");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Session Summary */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Mentor:</span>
            <span className="font-medium">{sessionDetails.mentorName}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">{sessionDetails.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-medium">{sessionDetails.time}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{sessionDetails.duration}</span>
          </div>
          <div className="flex justify-between">
            <span>Subject:</span>
            <span className="font-medium">{sessionDetails.subject}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-300">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">${amount.toFixed(2)} {currency}</span>
          </div>
        </div>
      </Card>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <Label className="text-base font-semibold mb-3 block">Select Payment Method</Label>
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              disabled={!method.available}
              className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-all ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${!method.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {method.icon}
              <span className="font-medium">{method.name}</span>
              {selectedMethod === method.id && (
                <Check className="w-5 h-5 text-blue-500 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Payment Forms */}
      {selectedMethod === "card" && (
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-semibold">Card Details</h3>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedMethod === "bank_transfer" && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Bank Transfer Details</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Transfer to:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Bank:</strong> EduVibe Bank</p>
              <p><strong>Account Name:</strong> EduVibe Mentoring Platform</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Routing Number:</strong> 123456789</p>
              <p><strong>Amount:</strong> ${amount.toFixed(2)} {currency}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="bankSlip">Upload Transfer Slip *</Label>
            <input
              id="bankSlip"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a clear image or PDF of your transfer receipt
            </p>
            {bankSlipFile && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {bankSlipFile.name} selected
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        
        <Button
          onClick={selectedMethod === "card" ? handleCardPayment : handleBankTransfer}
          disabled={isProcessing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
        <Lock className="w-3 h-3 mr-1" />
        Your payment information is secure and encrypted
      </div>
    </div>
  );
}