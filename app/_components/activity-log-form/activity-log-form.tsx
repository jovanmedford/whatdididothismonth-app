import { Button } from "../button";
import { Input } from "../input";

export function ActivityLogForm({ onSubmit }: { onSubmit?: (label: string, target: number) => Promise<void> }) {
    return (
        <form onSubmit={(e) => {
            e.preventDefault();

            const data = new FormData(e.currentTarget);
            const label = data.get("label") as string;
            const target = parseInt(data.get("target") as string);

            if (onSubmit) {
                onSubmit(label, target); // Example year and month values
            }
        }}>
            <div>
                <Input id="create-activity-log-label" name="label" label="Label" required />
            </div>
            <div>
                <Input id="create-activity-log-target" name="target" label="Target" type="number" required />
            </div>
            <div className="mt-4 flex justify-end">
                <Button type="submit" variant="primary">Create Log</Button>
            </div>

        </form>

    )
}