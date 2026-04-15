"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  SendIcon
} from "lucide-react"

const contactInfo = [
  {
    icon: MailIcon,
    label: "Email",
    value: "support@uthbus.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: PhoneIcon,
    label: "Phone",
    value: "+977 980-000-0000",
    sub: "Mon–Sat, 8 AM – 8 PM",
  },
  {
    icon: MapPinIcon,
    label: "Office",
    value: "Kathmandu, Nepal",
    sub: "Head Office",
  },
  {
    icon: ClockIcon,
    label: "Support Hours",
    value: "24 / 7",
    sub: "Live chat available",
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [sending, setSending] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Simulate a network request
    await new Promise((r) => setTimeout(r, 800))
    setSending(false)
    toast.success("Message sent!", { description: "We'll get back to you within 24 hours." })
    setForm({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="bg-card border-b border-border py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <MailIcon className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Contact Us</h1>
          <p className="text-muted-foreground">
            Have a question or need help with a booking? We&apos;re here for you.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">Contact Information</h2>
          {contactInfo.map((item) => (
            <div key={item.label} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="bg-primary/10 p-2.5 rounded-lg">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{item.label}</p>
                <p className="text-foreground font-medium">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" required value={form.name} onChange={set("name")} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="your@email.com" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required value={form.subject} onChange={set("subject")} placeholder="How can we help?" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us more about your query…"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-all duration-200 resize-none"
                  />
                </div>

                <Button type="submit" disabled={sending} className="w-full">
                  <SendIcon className="w-4 h-4 mr-2" />
                  {sending ? "Sending…" : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
