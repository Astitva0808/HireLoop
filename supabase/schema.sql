-- HireLoop Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all tables.

-- =====================================================
-- PROFILES
-- =====================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('company', 'student')),
  full_name text not null,
  email text,
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- =====================================================
-- COMPANIES
-- =====================================================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text not null,
  website text default '' not null,
  industry text default '' not null,
  description text default '' not null,
  location text default '' not null,
  company_size text default '' not null,
  logo_url text default '' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (owner_id, email)
);

alter table public.companies enable row level security;

create policy "Companies are visible to authenticated users"
  on public.companies for select
  using (auth.role() = 'authenticated');

create policy "Company owners can insert their own company"
  on public.companies for insert
  with check (auth.uid() = owner_id);

create policy "Company owners can update their own company"
  on public.companies for update
  using (auth.uid() = owner_id);

create policy "Company owners can delete their own company"
  on public.companies for delete
  using (auth.uid() = owner_id);


-- =====================================================
-- CANDIDATES
-- =====================================================

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  name text not null,
  email text not null,
  branch text default '' not null,
  skills text[] default '{}' not null,
  resume_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.candidates enable row level security;

create policy "Candidates can view their own profile"
  on public.candidates for select
  using (auth.uid() = user_id);

create policy "Candidates can insert their own profile"
  on public.candidates for insert
  with check (auth.uid() = user_id);

create policy "Candidates can update their own profile"
  on public.candidates for update
  using (auth.uid() = user_id);

create policy "Companies can view all candidates"
  on public.candidates for select
  using (
    exists (
      select 1 from public.companies
      where owner_id = auth.uid()
    )
  );


-- =====================================================
-- DRIVES
-- =====================================================

create table if not exists public.drives (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies on delete cascade not null,
  title text not null,
  role text not null,
  description text default '' not null,
  skills text[] default '{}' not null,
  experience_level text default '' not null,
  location text default '' not null,
  status text not null default 'open' check (status in ('draft', 'open', 'closed')),
  application_deadline text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.drives enable row level security;

create policy "Open drives are visible to authenticated users"
  on public.drives for select
  using (
    status = 'open' and auth.role() = 'authenticated'
  );

create policy "Company owners can view their own drives"
  on public.drives for select
  using (
    exists (
      select 1 from public.companies
      where companies.id = drives.company_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Company owners can insert their own drives"
  on public.drives for insert
  with check (
    exists (
      select 1 from public.companies
      where companies.id = drives.company_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Company owners can update their own drives"
  on public.drives for update
  using (
    exists (
      select 1 from public.companies
      where companies.id = drives.company_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Company owners can delete their own drives"
  on public.drives for delete
  using (
    exists (
      select 1 from public.companies
      where companies.id = drives.company_id
        and companies.owner_id = auth.uid()
    )
  );


-- =====================================================
-- APPLICATIONS
-- =====================================================

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  drive_id uuid references public.drives on delete cascade not null,
  candidate_id uuid references public.candidates on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (drive_id, candidate_id)
);

alter table public.applications enable row level security;

create policy "Candidates can view their own applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.candidates
      where candidates.id = applications.candidate_id
        and candidates.user_id = auth.uid()
    )
  );

create policy "Candidates can insert their own applications"
  on public.applications for insert
  with check (
    exists (
      select 1 from public.candidates
      where candidates.id = applications.candidate_id
        and candidates.user_id = auth.uid()
    )
  );

create policy "Candidates can delete their own applications"
  on public.applications for delete
  using (
    exists (
      select 1 from public.candidates
      where candidates.id = applications.candidate_id
        and candidates.user_id = auth.uid()
    )
  );

create policy "Companies can view applications for their drives"
  on public.applications for select
  using (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = applications.drive_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can update applications for their drives"
  on public.applications for update
  using (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = applications.drive_id
        and companies.owner_id = auth.uid()
    )
  );


-- =====================================================
-- INTERVIEWS
-- =====================================================

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications on delete cascade not null unique,
  drive_id uuid references public.drives on delete cascade not null,
  candidate_id uuid references public.candidates on delete cascade not null,
  scheduled_at text,
  interview_type text not null default 'ai',
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed')),
  session_id text unique,
  overall_score numeric(4,2),
  summary text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.interviews enable row level security;

create policy "Candidates can view their own interviews"
  on public.interviews for select
  using (
    exists (
      select 1 from public.candidates
      where candidates.id = interviews.candidate_id
        and candidates.user_id = auth.uid()
    )
  );

create policy "Companies can view interviews for their drives"
  on public.interviews for select
  using (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = interviews.drive_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can insert interviews for their drives"
  on public.interviews for insert
  with check (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = interviews.drive_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can update interviews for their drives"
  on public.interviews for update
  using (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = interviews.drive_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can delete interviews for their drives"
  on public.interviews for delete
  using (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = interviews.drive_id
        and companies.owner_id = auth.uid()
    )
  );


-- =====================================================
-- REPORTS
-- =====================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references public.interviews on delete cascade not null unique,
  candidate_id uuid references public.candidates on delete cascade not null,
  drive_id uuid references public.drives on delete cascade not null,
  overall_score numeric(4,2),
  summary text default '' not null,
  strength text default '' not null,
  recommendations text default '' not null,
  skill_breakdown jsonb,
  status text not null default 'completed' check (status in ('draft', 'completed')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.reports enable row level security;

create policy "Candidates can view their own reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.candidates
      where candidates.id = reports.candidate_id
        and candidates.user_id = auth.uid()
    )
  );

create policy "Companies can view reports for their drives"
  on public.reports for select
  using (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = reports.drive_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can insert reports for their drives"
  on public.reports for insert
  with check (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = reports.drive_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can update reports for their drives"
  on public.reports for update
  using (
    exists (
      select 1 from public.drives
      join public.companies on companies.id = drives.company_id
      where drives.id = reports.drive_id
        and companies.owner_id = auth.uid()
    )
  );


-- =====================================================
-- SETTINGS
-- =====================================================

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies on delete cascade not null unique,
  email_notifications boolean not null default true,
  interview_notifications boolean not null default true,
  application_notifications boolean not null default true,
  default_interview_type text not null default 'technical',
  default_interview_duration integer not null default 30,
  auto_generate_reports boolean not null default true,
  candidate_visibility text not null default 'full' check (candidate_visibility in ('full', 'limited', 'hidden')),
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;

create policy "Companies can view their own settings"
  on public.settings for select
  using (
    exists (
      select 1 from public.companies
      where companies.id = settings.company_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can insert their own settings"
  on public.settings for insert
  with check (
    exists (
      select 1 from public.companies
      where companies.id = settings.company_id
        and companies.owner_id = auth.uid()
    )
  );

create policy "Companies can update their own settings"
  on public.settings for update
  using (
    exists (
      select 1 from public.companies
      where companies.id = settings.company_id
        and companies.owner_id = auth.uid()
    )
  );


-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_companies_owner_id on public.companies(owner_id);
create index if not exists idx_candidates_user_id on public.candidates(user_id);
create index if not exists idx_drives_company_id on public.drives(company_id);
create index if not exists idx_applications_drive_id on public.applications(drive_id);
create index if not exists idx_applications_candidate_id on public.applications(candidate_id);
create index if not exists idx_interviews_drive_id on public.interviews(drive_id);
create index if not exists idx_interviews_candidate_id on public.interviews(candidate_id);
create index if not exists idx_reports_drive_id on public.reports(drive_id);
create index if not exists idx_reports_candidate_id on public.reports(candidate_id);
create index if not exists idx_settings_company_id on public.settings(company_id);
