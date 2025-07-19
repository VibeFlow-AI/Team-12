import SampleView from "@/components/sample-view";
import { getSamples } from "@/server/actions/sample";
import Navbar from "@/components/navbar";

async function SamplesPage() {
  const result = await getSamples();
  const samples = result.success ? result.samples : [];

  return (
    <div>
      <Navbar />
      <SampleView initialSamples={samples} />
    </div>
  );
}

export default SamplesPage;
