"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";

function SkeletonBar({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.12),rgba(255,255,255,0.05))] ${className}`.trim()}
    />
  );
}

export function OverviewSkeleton() {
  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-12">
      <DashboardPanel className="xl:col-span-12 p-7 sm:p-8">
        <div className="flex min-h-[18rem] flex-col justify-between gap-8">
          <div className="space-y-4">
            <SkeletonBar className="h-3 w-36" />
            <SkeletonBar className="h-16 w-72 max-w-full" />
          </div>
          <SkeletonBar className="h-8 w-[34rem] max-w-full rounded-[1rem]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
              >
                <SkeletonBar className="h-3 w-28" />
                <SkeletonBar className="mt-4 h-7 w-24 rounded-[0.7rem]" />
              </div>
            ))}
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel className="xl:col-span-12 p-7 sm:p-8">
        <div className="flex min-h-[18rem] flex-col gap-6">
          <div className="flex gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-1">
            <SkeletonBar className="h-11 flex-1" />
            <SkeletonBar className="h-11 flex-1" />
          </div>
          <div className="space-y-4">
            <SkeletonBar className="h-4 w-40" />
            <SkeletonBar className="h-16 w-full rounded-[1rem]" />
          </div>
          <SkeletonBar className="h-20 w-full rounded-[1rem]" />
          <SkeletonBar className="mt-auto h-12 w-full" />
        </div>
      </DashboardPanel>
    </div>
  );
}

export function VaultSkeleton() {
  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-12">
      <DashboardPanel className="xl:col-span-4 p-7 sm:p-8">
        <div className="space-y-5">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-12 w-36" />
          <SkeletonBar className="h-24 w-full rounded-[1rem]" />
        </div>
      </DashboardPanel>
      <DashboardPanel className="xl:col-span-8 p-7 sm:p-8">
        <div className="space-y-5">
          <SkeletonBar className="h-4 w-32" />
          <SkeletonBar className="h-8 w-64" />
          <SkeletonBar className="h-28 w-full rounded-[1rem]" />
        </div>
      </DashboardPanel>
      <DashboardPanel className="xl:col-span-12 p-7 sm:p-8">
        <SkeletonBar className="h-[18rem] w-full rounded-[1.2rem]" />
      </DashboardPanel>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-12">
      <DashboardPanel className="xl:col-span-4 p-7 sm:p-8">
        <SkeletonBar className="h-[20rem] w-full rounded-[1.2rem]" />
      </DashboardPanel>
      <DashboardPanel className="xl:col-span-8 p-7 sm:p-8">
        <SkeletonBar className="h-[20rem] w-full rounded-[1.2rem]" />
      </DashboardPanel>
      <DashboardPanel className="xl:col-span-4 p-7 sm:p-8">
        <SkeletonBar className="h-[14rem] w-full rounded-[1.2rem]" />
      </DashboardPanel>
      <DashboardPanel className="xl:col-span-8 p-7 sm:p-8">
        <SkeletonBar className="h-[14rem] w-full rounded-[1.2rem]" />
      </DashboardPanel>
    </div>
  );
}
