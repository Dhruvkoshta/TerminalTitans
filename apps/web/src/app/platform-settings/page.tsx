'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// heroicons
import {
  Cog6ToothIcon,
  LockClosedIcon,
  PuzzlePieceIcon,
  CreditCardIcon,
  CheckIcon,
  CloudArrowUpIcon,
  TrashIcon,
  KeyIcon,
  LinkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function PlatformSettingsPage() {
  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'auth', label: 'Authentication & Security', icon: LockClosedIcon },
    { id: 'integrations', label: 'Integrations', icon: PuzzlePieceIcon },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCardIcon },
  ];

  const [active, setActive] = useState('general');
  const [isDirty, setIsDirty] = useState(false);

  // General tab state
  const [platformName, setPlatformName] = useState('PROCTO');
  const [supportEmail, setSupportEmail] = useState('support@procto.ai');
  const [brandColor, setBrandColor] = useState('#7c3aed');
  const [logoDark, setLogoDark] = useState<File | null>(null);
  const [logoLight, setLogoLight] = useState<File | null>(null);

  // Auth tab state
  const [enableGoogle, setEnableGoogle] = useState(true);
  const [enableMicrosoft, setEnableMicrosoft] = useState(false);
  const [forceSSODomain, setForceSSODomain] = useState('');
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireCase, setRequireCase] = useState(true);
  const [requireNumberSymbol, setRequireNumberSymbol] = useState(true);

  // Integrations tab state
  const [apiKeys, setApiKeys] = useState([
    { id: 'k_1', name: 'Default Key', key: 'sk_...a1b2' },
    { id: 'k_2', name: 'CI Key', key: 'sk_...c3d4' },
  ]);
  const [ltiKey] = useState('lti_key_XXXX');
  const [ltiSecret] = useState('lti_secret_YYYY');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState({
    examCompleted: true,
    studentEnrolled: true,
    examStarted: false,
  });

  // Billing tab (placeholder usage numbers)
  const usage = useMemo(() => ({
    proctoredExams: { used: 850, limit: 1000 },
    activeStudents: { used: 1200, limit: 1500 },
    apiCalls: { used: 150000, limit: 200000 },
  }), []);

  function markDirty() {
    setIsDirty(true);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) {
    const file = e.target.files?.[0] ?? null;
    setter(file);
    markDirty();
  }

  function generateApiKey() {
    const id = `k_${Math.random().toString(36).slice(2, 9)}`;
    const newKey = { id, name: `Key ${apiKeys.length + 1}`, key: `sk_...${Math.random().toString(36).slice(2,6)}` };
    setApiKeys((s) => [newKey, ...s]);
    markDirty();
  }

  function deleteApiKey(id: string) {
    setApiKeys((s) => s.filter(k => k.id !== id));
    markDirty();
  }

  function toggleWebhookEvent(eventKey: keyof typeof webhookEvents) {
    setWebhookEvents(prev => ({ ...prev, [eventKey]: !prev[eventKey] }));
    markDirty();
  }

  function resetLTIKeys() {
    // placeholder: would call API
    alert('LTI keys have been reset (placeholder)');
    markDirty();
  }

  function sendTestWebhook() {
    // placeholder
    alert(`Sending test webhook to ${webhookUrl || '(not set)'} (placeholder)`);
  }

  function saveAll() {
    // placeholder: submit all settings
    const payload = {
      general: { platformName, supportEmail, brandColor },
      auth: { enableGoogle, enableMicrosoft, forceSSODomain, minPasswordLength, requireCase, requireNumberSymbol },
      integrations: { apiKeys, ltiKey, ltiSecret, webhookUrl, webhookEvents },
    };
    console.log('Saving settings', payload);
    setIsDirty(false);
    alert('Settings saved (placeholder)');
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Configure platform-wide options for PROCTO.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={saveAll} disabled={!isDirty} className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <nav className="sticky top-6 space-y-3 bg-slate-900 p-4 rounded-lg shadow-md text-white">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === active;
              const btnClasses = isActive ? 'bg-indigo-700 ring-1 ring-indigo-500 text-white' : 'hover:bg-slate-800 text-gray-300';

              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded ${btnClasses}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-200'}`}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="col-span-9 space-y-6">
          {/* General Tab */}
          {active === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Branding and basic platform identity.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Platform Name</Label>
                    <Input value={platformName} onChange={(e) => { setPlatformName(e.target.value); markDirty(); }} />

                    <Label>Primary Brand Color</Label>
                    <input type="color" value={brandColor} onChange={(e) => { setBrandColor(e.target.value); markDirty(); }} className="w-20 h-10 p-0 border rounded" />

                    <Label className="mt-4">Contact Information</Label>
                    <Label className="text-sm text-gray-600">Public Support Email</Label>
                    <Input value={supportEmail} onChange={(e) => { setSupportEmail(e.target.value); markDirty(); }} />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Logo (Dark Mode)</Label>
                      <div className="flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={(e) => handleFileInput(e, setLogoDark)} />
                        {logoDark ? <span className="text-sm text-gray-700">{logoDark.name}</span> : <span className="text-sm text-gray-400">No file selected</span>}
                      </div>
                    </div>

                    <div>
                      <Label>Logo (Light Mode)</Label>
                      <div className="flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={(e) => handleFileInput(e, setLogoLight)} />
                        {logoLight ? <span className="text-sm text-gray-700">{logoLight.name}</span> : <span className="text-sm text-gray-400">No file selected</span>}
                      </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                      Tip: Use a transparent PNG for logos to work on both backgrounds.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auth Tab */}
          {active === 'auth' && (
            <Card>
              <CardHeader>
                <CardTitle>Authentication & Security</CardTitle>
                <CardDescription>Manage sign-in methods, password policy, and roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <section className="space-y-3">
                    <h3 className="font-medium">SSO & Social Logins</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable Google Sign-In</p>
                          <p className="text-sm text-gray-500">Allow users to authenticate with Google.</p>
                        </div>
                        <input type="checkbox" checked={enableGoogle} onChange={(e) => { setEnableGoogle(e.target.checked); markDirty(); }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable Microsoft Sign-In</p>
                          <p className="text-sm text-gray-500">Allow users to authenticate with Microsoft accounts.</p>
                        </div>
                        <input type="checkbox" checked={enableMicrosoft} onChange={(e) => { setEnableMicrosoft(e.target.checked); markDirty(); }} />
                      </div>

                      <div className="col-span-2">
                        <Label>Force Single Sign-On (SSO) for domain</Label>
                        <Input placeholder="e.g., myuniversity.edu" value={forceSSODomain} onChange={(e) => { setForceSSODomain(e.target.value); markDirty(); }} />
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={requireCase} onChange={(e) => { setRequireCase(e.target.checked); markDirty(); }} />
                        <Label>Require uppercase & lowercase</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={requireNumberSymbol} onChange={(e) => { setRequireNumberSymbol(e.target.checked); markDirty(); }} />
                        <Label>Require numbers or symbols</Label>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-medium">User Roles</h3>
                    <div className="rounded border">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3">Role</th>
                            <th className="p-3">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-3 font-medium">Admin</td>
                            <td className="p-3 text-gray-600">Full access to platform settings and user management.</td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-3 font-medium">Educator</td>
                            <td className="p-3 text-gray-600">Create exams, manage students and view reports.</td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-3 font-medium">Student</td>
                            <td className="p-3 text-gray-600">Take exams and view personal results.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="pt-3">
                      <Button variant="outline">Manage Permissions</Button>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations Tab */}
          {active === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect PROCTO with external services and manage API keys.</CardDescription>
              </CardHeader>
              <CardContent>
                <section className="space-y-4">
                  <h3 className="font-medium">API Keys</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Button onClick={generateApiKey} className="flex items-center gap-2"><CloudArrowUpIcon className="w-4 h-4" />Generate New API Key</Button>
                  </div>

                  <div className="rounded border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3">Name</th>
                          <th className="p-3">Key</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map(k => (
                          <tr key={k.id} className="border-t">
                            <td className="p-3 font-medium">{k.name}</td>
                            <td className="p-3 text-gray-700">{k.key}</td>
                            <td className="p-3">
                              <Button variant="ghost" onClick={() => deleteApiKey(k.id)} className="text-red-600 flex items-center gap-2"><TrashIcon className="w-4 h-4" />Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="font-medium mt-6">LMS Integration (LTI)</h3>
                  <p className="text-sm text-gray-600">Configure PROCTO with your Learning Management System (Moodle, Canvas, etc.).</p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>LTI Key</Label>
                      <Input value={ltiKey} disabled />
                    </div>
                    <div>
                      <Label>LTI Secret</Label>
                      <Input value={ltiSecret} disabled />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" onClick={resetLTIKeys}>Reset Keys</Button>
                  </div>

                  <h3 className="font-medium mt-6">Webhooks</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Webhook Endpoint URL</Label>
                      <Input value={webhookUrl} onChange={(e) => { setWebhookUrl(e.target.value); markDirty(); }} placeholder="https://example.com/webhook" />
                    </div>
                    <div className="flex items-end gap-3">
                      <Button onClick={sendTestWebhook}>Send Test Webhook</Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="block mb-2">Events</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2"><input type="checkbox" checked={webhookEvents.examCompleted} onChange={() => toggleWebhookEvent('examCompleted')} /> <span>Exam Completed</span></div>
                      <div className="flex items-center gap-2"><input type="checkbox" checked={webhookEvents.studentEnrolled} onChange={() => toggleWebhookEvent('studentEnrolled')} /> <span>Student Enrolled</span></div>
                      <div className="flex items-center gap-2"><input type="checkbox" checked={webhookEvents.examStarted} onChange={() => toggleWebhookEvent('examStarted')} /> <span>Exam Started</span></div>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          )}

          {/* Billing Tab */}
          {active === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Usage</CardTitle>
                <CardDescription>Manage subscription and view platform usage.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="rounded border p-4">
                      <h4 className="font-medium">Current Plan</h4>
                      <p className="text-sm text-gray-600 mt-1">You are on the <strong>Enterprise Plan</strong>.</p>
                      <div className="mt-3">
                        <a className="text-primary underline" href="#" target="_blank" rel="noreferrer">Manage Subscription</a>
                      </div>
                    </div>

                    <div className="rounded border p-4">
                      <h4 className="font-medium">Monthly Usage</h4>

                      <div className="mt-4 space-y-4">
                        <UsageRow label="Proctored Exams" used={usage.proctoredExams.used} limit={usage.proctoredExams.limit} />
                        <UsageRow label="Active Students" used={usage.activeStudents.used} limit={usage.activeStudents.limit} />
                        <UsageRow label="API Calls" used={usage.apiCalls.used} limit={usage.apiCalls.limit} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded border p-4 text-center">
                      <SparklesIcon className="mx-auto w-10 h-10 text-yellow-500" />
                      <h4 className="font-medium mt-2">Optimize Your Plan</h4>
                      <p className="text-sm text-gray-600 mt-1">Contact sales to adjust limits or add custom integrations.</p>
                      <div className="mt-3">
                        <Button>Contact Sales</Button>
                      </div>
                    </div>

                    <div className="rounded border p-4">
                      <h4 className="font-medium">Billing Contacts</h4>
                      <p className="text-sm text-gray-600 mt-1">billing@procto.ai</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm">
        <div>{label}</div>
        <div className="font-medium">{used} / {limit}</div>
      </div>
      <div className="w-full bg-gray-200 rounded h-3 mt-2 overflow-hidden">
        <div className="h-3 bg-indigo-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
