import { useLocalSearchParams } from "expo-router";
import { getMethod, getModule } from "../catalog/apiCatalog";

export function useMethodMeta() {
  const { module: moduleId, method: methodId } = useLocalSearchParams<{
    module: string;
    method: string;
  }>();
  const mod = moduleId ? getModule(moduleId) : undefined;
  const method =
    moduleId && methodId ? getMethod(moduleId, methodId) : undefined;
  return { moduleId, methodId, mod, method };
}
