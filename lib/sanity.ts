const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mqlcvlsz'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

export async function sanityQuery(groqQuery: string) {
  const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent(groqQuery)}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  })
  const json = await response.json()
  if (json.error) {
    throw new Error(json.error.description || json.error.message)
  }
  return json.result
}

export async function sanityMutate(mutations: any[]) {
  const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/mutate/${dataset}?returnIds=true`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({mutations}),
  })
  const json = await response.json()
  if (json.error) {
    throw new Error(json.error.description || json.error.message)
  }
  return json.results
}
