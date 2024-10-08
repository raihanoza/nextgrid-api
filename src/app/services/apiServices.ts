export const apiPostFormData = async (resource: string, data: any) => {
  const res = await fetch(`api/${resource}`, {
    method: "POST",
    body: data,
  });
  const dataJson = await res.json();
  return dataJson;
};

export const apiEditData = async (resource: string, data: any) => {
  const res = await fetch(`${resource}`, {
    method: "POST",
    body: data,
  });
  const dataJson = await res.json();
  return dataJson;
};
