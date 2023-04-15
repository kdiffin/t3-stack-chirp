import Head from "next/head";
import React from "react";
import { api } from "~/utils/api";

const Profile: NextPage<{ userId: string }> = ({ userId }) => {
  const { data: userProfile, isLoading } =
    api.profile.getUserByUsername.useQuery({
      userId: userId,
    });

  if (isLoading) {
    return <div>loading.</div>;
  }

  if (!userProfile) throw new Error("Page not found");

  return (
    <>
      <Head>
        <title>{userProfile.username}</title>
      </Head>
      <div className="relative flex h-48 border-b  border-slate-400  bg-slate-600 p-5 px-12 pb-0">
        <Avatar
          width_height={180}
          className="absolute  top-20  border-8 border-slate-800 bg-slate-800"
          src={userProfile.profilePicture}
        />
        <div className=" mb-5 ml-auto mt-auto  text-3xl font-semibold">
          {userProfile.username}
        </div>

        <ProfileFeed userId={userId} />
      </div>
    </>
  );
};

function ProfileFeed(props: { userId: string }) {
  const { data } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  console.log(data);
  return <></>;
}

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { Avatar } from "~/components/Avatar";

//ssg with trpc helpers cuz u cant use hooks in getstaticprops
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const searchParamsUserId = context.params?.profile;

  if (typeof searchParamsUserId !== "string") throw new Error("no params");

  //ssg works like api here bc the router was defined as appRouter
  await ssg.profile.getUserByUsername.prefetch({ userId: searchParamsUserId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userId: searchParamsUserId,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  //no need to prerender all routes
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Profile;