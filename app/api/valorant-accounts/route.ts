import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("API route called - fetching fresh data") // Debug log

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "50")
    const minPrice = Number.parseInt(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseInt(searchParams.get("maxPrice") || "2000")
    const minInventoryValue = Number.parseInt(searchParams.get("minInventoryValue") || "1000")
    const region = searchParams.get("region") || "BRA"

    console.log(`Fetching fresh page ${page} with filters:`, {
      pageSize,
      minPrice,
      maxPrice,
      minInventoryValue,
      region,
    })

    // Check if API token exists
    if (!process.env.API_BEARER_TOKEN) {
      console.error("API_BEARER_TOKEN not found in environment variables")
      return NextResponse.json({ error: "API token not configured" }, { status: 500 })
    }

    // Build API URL with filters
    const apiUrl = new URL("https://api.lzt.market/riot")
    apiUrl.searchParams.set("page", page.toString())
    apiUrl.searchParams.set("per_page", pageSize.toString())
    apiUrl.searchParams.set("pmin", minPrice.toString())
    apiUrl.searchParams.set("pmax", maxPrice.toString())
    apiUrl.searchParams.set("order_by", "price_to_up")
    apiUrl.searchParams.set("inv_min", minInventoryValue.toString())

    // Add timestamp to prevent caching
    apiUrl.searchParams.set("_t", Date.now().toString())

    // Always filter by Brazil
    apiUrl.searchParams.set("country[]", "BRA")

    console.log("Calling external API:", apiUrl.toString())

    const response = await fetch(apiUrl.toString(), {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${process.env.API_BEARER_TOKEN}`,
        "Cache-Control": "no-cache",
      },
      cache: "no-store", // Não usar cache
      // Add timeout
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    console.log("External API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("External API error:", errorText)
      return NextResponse.json(
        { error: `External API error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Fresh external API data received, items count:", data.items?.length || 0)

    // Calculate pagination info - FIXED
    const itemsPerPage = pageSize
    const totalItemsFromAPI = data.total || 1000 // Use API total or fallback
    const calculatedTotalPages = Math.ceil(totalItemsFromAPI / itemsPerPage)
    const totalPages = Math.min(calculatedTotalPages, 15) // Limit to 15 pages max
    const currentPage = page

    const responseData = {
      items: data.items || [],
      currentPage: currentPage,
      totalPages: totalPages,
      totalItems: totalItemsFromAPI,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      timestamp: Date.now(),
    }

    // Set no-cache headers
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch Valorant accounts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
