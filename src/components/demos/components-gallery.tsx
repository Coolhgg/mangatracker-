"use client";

import React from "react";
import { SeriesCard } from "@/components/SeriesCard";
import { ChapterRow } from "@/components/ChapterRow";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { FAB } from "@/components/FAB";
import { Drawer } from "@/components/Drawer";
import { Modal } from "@/components/Modal";
import { FiltersPanel } from "@/components/FiltersPanel";
import { CommentList } from "@/components/CommentList";
import { CommentComposer } from "@/components/CommentComposer";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { Toasts } from "@/components/Toasts";
import { Skeletons } from "@/components/Skeletons";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type GalleryProps = {
  mockSeries?: { title: string; cover?: string | null; subtitle?: string }[];
};

export const ComponentsGallery: React.FC<GalleryProps> = ({ mockSeries = [] }) => {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <div className="container mx-auto max-w-6xl space-y-16 py-10">
      <section>
        <h2 className="text-2xl font-bold">SeriesCard</h2>
        <p className="text-sm text-muted-foreground">Default, hover, and with subtitle</p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {mockSeries.slice(0, 3).map((s, i) => (
            <SeriesCard key={i} title={s.title} cover={s.cover} subtitle={i === 1 ? s.subtitle : undefined} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">ChapterRow</h2>
        <div className="mt-4 space-y-2">
          <ChapterRow number={101} title="The Red Cliff" href="#" />
          <ChapterRow number={102} title="Echoes of the Sea" href="#" isRead />
          <ChapterRow number={103} title="Winds of Fate" href="#" isActive />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Badges & Avatar</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Avatar name="Roronoa Zoro" src={mockSeries[0]?.cover || undefined} size="lg" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Drawer, Modal & FAB</h2>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={() => setOpenDrawer(true)}>Open Drawer</Button>
          <Button onClick={() => setOpenModal(true)} variant="secondary">Open Modal</Button>
          <FAB label="Add" onClick={() => setOpenModal(true)} />
        </div>
        <Drawer open={openDrawer} onOpenChange={setOpenDrawer} title="Filters">
          <div className="p-4">
            <FiltersPanel onChange={() => {}} values={{}} />
          </div>
        </Drawer>
        <Modal open={openModal} onOpenChange={setOpenModal} title="Quick Action">
          <div className="p-6">
            <p className="text-sm text-muted-foreground">A simple modal body with actions.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenModal(false)}>Cancel</Button>
              <Button onClick={() => setOpenModal(false)}>Confirm</Button>
            </div>
          </div>
        </Modal>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Comments (Discord-like)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border">
            <div className="p-3 border-b"><strong>Thread</strong></div>
            <CommentList
              comments={[
                { id: "c1", author: { name: "Ken" }, content: "This arc goes crazy! 🔥", createdAt: Date.now() - 1000 * 60 * 5, reactions: { "+1": 3, "🔥": 5 } },
                { id: "c2", author: { name: "Mei" }, content: "@Ken totally agree — chapter 103 best moment.", createdAt: Date.now() - 1000 * 60 * 3, reactions: { "❤️": 2 } },
              ]}
              onReact={() => {}}
              onOpenThread={() => {}}
            />
            <div className="p-3 border-t">
              <CommentComposer placeholder="Message #general" onSend={() => {}} typingUsers={["Ken", "Yuno"]} />
            </div>
          </div>
          <ThreadSidebar
            thread={{ id: "t1", title: "Chapter 103 Discussion" }}
            onClose={() => {}}
            comments={[{ id: "tc1", author: { name: "Yuno" }, content: "Loved the pacing.", createdAt: Date.now() - 1000 * 60 * 1 }]}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Toasts & Skeletons</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button onClick={() => Toasts.success("Success!")}>Show success</Button>
            <Button variant="secondary" onClick={() => Toasts.error("Something went wrong")}>Show error</Button>
            <Button variant="ghost" onClick={() => Toasts.info("Heads up")}>Show info</Button>
          </div>
          <div className="w-full max-w-sm">
            <Skeletons.Card />
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Skeletons.Thumbnail />
              <Skeletons.Thumbnail />
              <Skeletons.Thumbnail />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Micro-interactions</h2>
        <p className="text-sm text-muted-foreground">Framer Motion demo</p>
        <div className="mt-4 flex gap-4">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} whileHover={{ y: -6 }} className="h-16 w-24 rounded-lg border bg-card shadow-sm" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ComponentsGallery;