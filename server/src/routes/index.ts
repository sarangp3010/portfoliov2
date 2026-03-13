import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { config } from '../config/index.js';
import { authenticate, adminOnly, customerAuth } from '../middleware/auth.js';
import { login, me, changePassword } from '../controllers/auth.controller.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { getProjects, getProject, createProject, updateProject, deleteProject, trackClick } from '../controllers/project.controller.js';
import { getPosts, getPost, getTags, createPost, updatePost, deletePost } from '../controllers/blog.controller.js';
import {
  getServices, createService, updateService, deleteService,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getActiveResume, getAllResumes, uploadResume, downloadResume, setActiveResume, deleteResume,
  submitInquiry, getInquiries, updateInquiryStatus, deleteInquiry,
} from '../controllers/content.controller.js';
import { track, getSummary, getBlogStats, getProjectStats, getVisitorStats } from '../controllers/analytics.controller.js';
import { listFlags, toggleFlag, patchFlag, publicFlags } from '../controllers/flags.controller.js';
import { listVersions, getVersion, restoreVersion } from '../controllers/versions.controller.js';
import { createCheckout, stripeWebhook, paymentStatus, paymentAnalytics, listPayments, getStripePublishableKey, getPlans } from '../controllers/payment.controller.js';
import { fetchTheme, saveTheme } from '../controllers/theme.controller.js';
import { getResumeData, getPortfolioData, getAnalyticsReportData } from '../controllers/pdf.controller.js';
import {
  diagnosticsOverview, eventLog, navFlows, smartInsights,
  activeVisitors, sessionTimeline, listSessions,
} from '../controllers/diagnostics.controller.js';
import {
  register as customerRegister, login as customerLogin, logout as customerLogout,
  me as customerMe, updateProfile as customerUpdateProfile,
  getMyPayments, createCustomerCheckout, getReceipt,
  getPaymentMethods, setupPaymentMethod, deletePaymentMethod,
  sendMessage,
  adminListCustomers, adminGetCustomer, adminToggleCustomer,
  adminListSessions, adminTerminateSession,
  adminListMessages, adminReplyMessage,
} from '../controllers/customer.controller.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: config.maxFileSize }, fileFilter: (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'));
}});

const admin = [authenticate, adminOnly];

export const createRouter = () => {
  const r = Router();

  // ─── Auth ─────────────────────────────────────────────────────────────────
  r.post('/auth/login', login);
  r.get('/auth/me', authenticate, me);
  r.post('/auth/change-password', authenticate, changePassword);

  // ─── Profile ──────────────────────────────────────────────────────────────
  r.get('/profile', getProfile);
  r.put('/profile', ...admin, updateProfile);

  // ─── Projects ─────────────────────────────────────────────────────────────
  r.get('/projects', getProjects);
  r.get('/projects/:id', getProject);
  r.post('/projects', ...admin, createProject);
  r.put('/projects/:id', ...admin, updateProject);
  r.delete('/projects/:id', ...admin, deleteProject);
  r.post('/projects/:id/click', trackClick);

  // ─── Blog ─────────────────────────────────────────────────────────────────
  r.get('/blog', getPosts);
  r.get('/blog/tags', getTags);
  r.get('/blog/:slug', getPost);
  r.post('/blog', ...admin, createPost);
  r.put('/blog/:id', ...admin, updatePost);
  r.delete('/blog/:id', ...admin, deletePost);

  // ─── Services ─────────────────────────────────────────────────────────────
  r.get('/services', getServices);
  r.post('/services', ...admin, createService);
  r.put('/services/:id', ...admin, updateService);
  r.delete('/services/:id', ...admin, deleteService);

  // ─── Testimonials ─────────────────────────────────────────────────────────
  r.get('/testimonials', getTestimonials);
  r.post('/testimonials', ...admin, createTestimonial);
  r.put('/testimonials/:id', ...admin, updateTestimonial);
  r.delete('/testimonials/:id', ...admin, deleteTestimonial);

  // ─── Resume ───────────────────────────────────────────────────────────────
  r.get('/resume', getActiveResume);
  r.get('/resume/all', ...admin, getAllResumes);
  r.get('/resume/download', downloadResume);
  r.post('/resume/upload', ...admin, upload.single('resume'), uploadResume);
  r.patch('/resume/:id/activate', ...admin, setActiveResume);
  r.delete('/resume/:id', ...admin, deleteResume);

  // ─── Inquiries ────────────────────────────────────────────────────────────
  r.post('/inquiries', submitInquiry);
  r.get('/inquiries', ...admin, getInquiries);
  r.patch('/inquiries/:id/status', ...admin, updateInquiryStatus);
  r.delete('/inquiries/:id', ...admin, deleteInquiry);

  // ─── Analytics ────────────────────────────────────────────────────────────
  r.post('/analytics/track', track);
  r.get('/analytics/summary', ...admin, getSummary);
  r.get('/analytics/blogs', ...admin, getBlogStats);
  r.get('/analytics/projects', ...admin, getProjectStats);
  r.get('/analytics/visitors', ...admin, getVisitorStats);

  // ─── Real-Time & Sessions ─────────────────────────────────────────────────
  r.get('/analytics/active', ...admin, activeVisitors);
  r.get('/analytics/sessions', ...admin, listSessions);
  r.get('/analytics/sessions/:sessionId', ...admin, sessionTimeline);

  // ─── Smart Insights & Nav Flows ───────────────────────────────────────────
  r.get('/analytics/insights', ...admin, smartInsights);
  r.get('/analytics/flows', ...admin, navFlows);

  // ─── Diagnostics / Developer Console ─────────────────────────────────────
  r.get('/dev/diagnostics', ...admin, diagnosticsOverview);
  r.get('/dev/event-log', ...admin, eventLog);

  // ─── Feature Flags ────────────────────────────────────────────────────────
  r.get('/flags', publicFlags);                           // public: key→bool map
  r.get('/admin/flags', ...admin, listFlags);             // admin: full details
  r.patch('/admin/flags/:key/toggle', ...admin, toggleFlag);
  r.patch('/admin/flags/:key', ...admin, patchFlag);

  // ─── Version History ──────────────────────────────────────────────────────
  r.get('/versions/:type/:id', ...admin, listVersions);
  r.get('/versions/snapshot/:versionId', ...admin, getVersion);
  r.post('/versions/restore/:versionId', ...admin, restoreVersion);

  // ─── Payments ─────────────────────────────────────────────────────────────
  r.get('/payments/key',   getStripePublishableKey);                        // public: publishable key
  r.get('/payments/plans', getPlans);                                       // public: service plans list
  r.post('/payments/checkout', createCheckout);                             // create checkout session
  r.get('/payments/status/:sessionId', paymentStatus);                      // get payment status
  r.post('/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook); // Stripe webhook (raw body)
  r.get('/admin/payments', ...admin, listPayments);                         // admin: payment list (supports ?source=direct|inquiry)
  r.get('/admin/payments/analytics', ...admin, paymentAnalytics);           // admin: revenue analytics

  // ─── PDF Export Data ──────────────────────────────────────────────────────
  r.get('/pdf/resume-data', getResumeData);                                // public: resume PDF data
  r.get('/pdf/portfolio-data', getPortfolioData);                          // public: portfolio PDF data
  r.get('/admin/pdf/analytics-data', ...admin, getAnalyticsReportData);    // admin: analytics PDF data

  // ─── Theme ────────────────────────────────────────────────────────────────
  r.get('/theme', fetchTheme);                                             // public: current theme
  r.put('/admin/theme', ...admin, saveTheme);                              // admin: update theme

  // ─── Customer Auth ────────────────────────────────────────────────────────
  r.post('/customer/auth/register', customerRegister);
  r.post('/customer/auth/login',    customerLogin);
  r.post('/customer/auth/logout',   customerAuth, customerLogout);
  r.get('/customer/auth/me',        customerAuth, customerMe);

  // OAuth placeholder — returns URL for provider (handled via redirect in production)
  r.get('/customer/auth/oauth/:provider', (req, res) => {
    const provider = req.params.provider;
    // In production, configure OAuth with passport.js or similar
    // For now return a message explaining setup is needed
    res.json({
      success: false,
      error: `OAuth with ${provider} requires server-side OAuth configuration. See docs/customer-portal.md`,
      data: { url: '/login' },
    });
  });

  // ─── Customer Portal: Profile ────────────────────────────────────────────
  r.put('/customer/profile', customerAuth, customerUpdateProfile);

  // ─── Customer Portal: Payments ───────────────────────────────────────────
  r.get('/customer/payments',              customerAuth, getMyPayments);
  r.post('/customer/payments/checkout',    customerAuth, createCustomerCheckout);
  r.get('/customer/payments/:paymentId/receipt', customerAuth, getReceipt);

  // ─── Customer Portal: Payment Methods ───────────────────────────────────
  r.get('/customer/payment-methods',        customerAuth, getPaymentMethods);
  r.post('/customer/payment-methods/setup', customerAuth, setupPaymentMethod);
  r.delete('/customer/payment-methods/:pmId', customerAuth, deletePaymentMethod);

  // ─── Customer Portal: Messages ───────────────────────────────────────────
  r.post('/customer/messages', customerAuth, sendMessage);

  // ─── Admin: Customer Management ──────────────────────────────────────────
  r.get('/admin/customers',                       ...admin, adminListCustomers);
  r.get('/admin/customers/:id',                   ...admin, adminGetCustomer);
  r.patch('/admin/customers/:id/active',          ...admin, adminToggleCustomer);
  r.get('/admin/customers/sessions',              ...admin, adminListSessions);
  r.delete('/admin/customers/sessions/:sessionId', ...admin, adminTerminateSession);
  r.get('/admin/customers/messages',              ...admin, adminListMessages);
  r.post('/admin/customers/messages/:msgId/reply', ...admin, adminReplyMessage);

  return r;
};
