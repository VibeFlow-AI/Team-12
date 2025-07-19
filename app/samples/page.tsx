import SampleView from "@/components/sample-view";
import { getSamples } from "@/server/actions/sample";

async function Home() {
  const result = await getSamples();
  const samples = result.success ? result.samples : [];

  return <SampleView initialSamples={samples} />;
}

export default Home;
