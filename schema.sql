-- Run this in your Supabase SQL Editor to create the table
create table "Diagnosis" (
  id bigint primary key generated always as identity,
  "createdAt" timestamp with time zone default now(),
  "imageUrl" text,
  "cropType" text not null,
  "growthStage" text not null,
  "season" text not null,
  "location" text,
  "diseaseName" text not null,
  "confidence" double precision not null,
  "treatment" text, -- Storing JSON string or description
  "userId" text
);
