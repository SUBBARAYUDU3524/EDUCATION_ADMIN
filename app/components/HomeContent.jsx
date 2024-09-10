"use client";
import { useRouter } from "next/navigation";
import React from "react";

const HomeContent = () => {
  const router = useRouter();
  const { query } = router;

  // Get the 'content' query parameter
  const content = query.content;

  return (
    <div>
      <p>Content: {content}</p>
    </div>
  );
};

export default HomeContent;
