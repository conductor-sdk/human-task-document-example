import { Stack, Box, TextField, MenuItem } from "@mui/material";
import {
  orkesConductorClient,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript";
import MainLayout from "@/components/MainLayout";
import {
  SecondaryButton,
} from "@/components/elements/buttons/Buttons";
import { useState } from "react";
import { MainTitle, SubText2 } from "@/components/elements/texts/Typographys";
import getConfig from "next/config";
import { useRouter } from "next/navigation";

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  // With the client pull the workflow with correlationId (correlation id is not really needed it just helps to group orders together)
  return {
    props: {
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
      workflows: publicRuntimeConfig.workflows,
      correlationId: publicRuntimeConfig.workflows.correlationId,
    },
  };
}

type Props = {
  conductor: {
    serverUrl: string;
    TOKEN: string;
  };
  workflows: Record<string, string>;
  correlationId: string;
};

export default function Loan({ conductor, workflows, correlationId }: Props) {
  const [userId, setUserId] = useState("");

  const router = useRouter();
  const handleRequestForLoan = () => {
    const runWorkflow = async () => {
      const client = await orkesConductorClient(conductor);
      const executionId = await new WorkflowExecutor(client).startWorkflow({
        name: workflows.requestForLoan,
        version: 1,
        input: {
          userId,
        },
        correlationId
      });
      router.push(`/packet/${executionId}`);
    };
    runWorkflow();
  };

  return (
    <MainLayout title="Most Trusted">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Fake login a user</MainTitle>
        <Box>
          <SubText2 paragraph>Enter a user name</SubText2>
        </Box>
        <Stack spacing={2} direction="column">
          <TextField
            label="User"
            onChange={(ev) => setUserId(ev.target.value)}
            value={userId}
          />
          <SecondaryButton onClick={handleRequestForLoan}>
            Submit
          </SecondaryButton>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
