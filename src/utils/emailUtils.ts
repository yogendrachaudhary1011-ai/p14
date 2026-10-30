/**
 * Helper to construct a pre-composed mailto URL with professional subject and message body
 */
export function getPrewrittenMailtoUrl(
  recipient = 'yogendrachaudhary2061@gmail.com',
  customSubject?: string
): string {
  const email = (recipient && recipient.trim()) || 'yogendrachaudhary2061@gmail.com';
  const subject = customSubject || 'Product Design Inquiry — Yogendra Chaudhary';
  
  const body = `Hi Yogendra,

I came across your portfolio and would love to discuss a UI/UX and product design opportunity.

Here are a few details about what I'm looking for:
• Project / Role: 
• Scope & Platform (Web / Mobile / Design System): 
• Timeline / Target Start Date: 

Looking forward to hearing from you!

Best regards,
[Your Name]
[Company / Organization]`;

  const queryParams = new URLSearchParams({
    subject,
    body
  });

  return `mailto:${email}?${queryParams.toString()}`;
}
