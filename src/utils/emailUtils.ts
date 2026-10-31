/**
 * Open a pre-composed message in Gmail's browser composer, avoiding a device-level
 * mail-app prompt when visitors do not have a default mail application configured.
 */
export function getGmailComposeUrl(
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
    view: 'cm',
    fs: '1',
    to: email,
    su: subject,
    body
  });

  return `https://mail.google.com/mail/?${queryParams.toString()}`;
}
