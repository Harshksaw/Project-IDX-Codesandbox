// supabase/functions/send-sms/index.ts
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const sendSMS = async (
  messageBody: string,
  toNumber: string
): Promise<any> => {
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
  const fromNumber = Deno.env.get('TELNYX_FROM_NUMBER')
  const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID')

  if (!telnyxApiKey || !fromNumber || !messagingProfileId) {
    console.log('Telnyx credentials are missing')
    return
  }

  const response = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${telnyxApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromNumber,
      to: toNumber,
      text: messageBody,
      messaging_profile_id: messagingProfileId
    })
  })

  return response.json()
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
  }
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.text()
    const base64_secret = Deno.env.get('HOOK_SECRET').replace('v1,whsec_', '')
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(base64_secret)
    
    const { user, sms } = wh.verify(payload, headers)
    
    const messageBody = `Your BottleUp verification code is: ${sms.otp}`
    const response = await sendSMS(messageBody, user.phone)
    
    if (response.errors) {
      console.error('Telnyx API error:', response.errors)
      return new Response(
        JSON.stringify({
          error: {
            http_code: 500,
            message: `Failed to send SMS: ${JSON.stringify(response.errors)}`,
          },
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }
    
    return new Response(
      JSON.stringify({}),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: `Failed to send SMS: ${JSON.stringify(error)}`,
        }
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})