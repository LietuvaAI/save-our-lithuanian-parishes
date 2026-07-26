# Flow-chart research brief: parish outcome Sankey/alluvial

Research question: how does top-tier data journalism present lifecycle/outcome data as flow diagrams, and what does that mean for a static-SVG chart tracking ~181 historical ethnic-Lithuanian Catholic parishes to their present end states (still active / Lithuanian Mass continues / ethnically transferred / unresolved / closed — with closed parishes further split by building fate: demolished / repurposed / still standing)?

Confidence note on sourcing: search access to specific NYT/Reuters Graphics/Zeit Online/SBS-ABC interactive pages was inconsistent — many of these are JS-heavy, paywalled, or thinly indexed, and repeated searches returned tertiary summaries rather than the primary pages. Where I could not confirm a specific piece by direct fetch, I say so. Every exemplar below is a real, named, independently-verifiable piece or post; I did not invent any.

---

## (a) Named exemplars

1. **The Pudding / Colin Morris — "The Gyllenhaal Experiment" (2019)**, pudding.cool. One intended name ("Gyllenhaal") fans out into dozens of misspelling end-states typed by ~22,000 users, ribbon width = frequency. **Right:** this is the closest real-world match to our "one origin, many end states" shape — it proves a single-origin fan-out reads fine at high node count *when the end states are ranked by frequency and the rare ones are visually allowed to thin to hairlines rather than being forced to a uniform minimum width*. **Wrong for us:** it's playful/gamified (users generate their own branch), which is the opposite tone from a devastation-with-dignity story — the interaction model doesn't transfer, only the topology does.

2. **Financial Times — "In charts: How Brexit still divides British voters" (2026)** and the broader FT practice (Martin Stabe, FT visual journalism) of two-point-in-time alluvial diagrams for vote-share change between elections. **Right:** FT's house style colors bands by *origin* category and holds a consistent left-to-right time axis, which is the standard, well-tested approach for "where did group X end up" stories. **Caveat:** I could not fetch the live FT page directly (paywall/JS); this entry is grounded in FT's documented practice and its own social promotion of the piece, not a direct read of the current chart.

3. **Financial Times Visual Vocabulary** (github.com/Financial-Times/chart-doctor, `visual-vocabulary` folder). The newsroom's internal chart-choice poster groups Sankey/flow diagrams under a "Flow" category and defines their job as showing "volumes or intensity of movement between two or more states or conditions... good for tracing the eventual outcome of a complex process." **Right:** this is effectively a direct endorsement of our use case — outcome-tracing is exactly what the form is *for*, per the team that popularized the modern Sankey-in-news genre. It also explicitly separates "Flow" from "Spatial" (map) chart families — geography and fate are treated as two different jobs, not one chart.

4. **Datawrapper Blog — "10 ways to use fewer colors in your data visualizations"** (Lisa Charlotte Muth), datawrapper.de/blog. Uses a Wall Street Journal Sankey as the case study: a busy multi-flow diagram was made readable by desaturating everything except the one flow (Russia) the story was actually about, rather than giving every category its own hue. **Right:** direct, citable practitioner rule — color should serve emphasis, not just categorical decoration; a "gray-out-the-rest, color-the-point" strategy beats a rainbow legend once you have more than ~4-5 categories. Directly applicable to a "closed" branch we want to visually weight without shouting.

5. **DataViz Catalogue — "Differences between Sankey Diagrams, Parallel Sets & Alluvial Diagrams"** (datavizcatalogue.com/blog). Clarifies the taxonomy we're actually choosing inside: Sankey diagrams place nodes freely and are best for volume/process flow; alluvial diagrams (and parallel sets) require node columns to be aligned to fixed stages and drop the arrowheads since direction is implied by position. **Right:** this is the deciding technical fact for us — because our data is a fixed set of discrete stages (origin → outcome → building fate), not a freeform network, the *alluvial* convention (aligned node columns, no arrowheads, width = share) is the correct sub-form, not a generic freeform Sankey.

6. **Storytelling with Data — "What is a Sankey diagram?"** (storytellingwithdata.com/blog). Lays out when the form is right (process mapping, funnels, resource allocation — data with genuine directional flow) versus when it's abused (categorical data with no real flow forced into ribbons; flows so numerous the reader can't find the pattern; situations demanding precise value comparison, which ribbon widths can't deliver). **Right:** gives permission to say no to sub-splitting every branch — the guidance is explicit that added stages should earn their place by carrying real narrative information, not by symmetry.

7. **Pew Research Center — "How Americans change, keep their religious identities over their lives" (2025)**, religious-switching alluvial diagram (childhood religion → current religion, band color = childhood/origin tradition, width = share of population). Not a newsroom in the requested list, but structurally the single closest real analog to our chart I could verify: a fixed population sorted at birth into origin categories, tracked to a present-day state, with "stayed" and "left" as the emotional core of the story. **Right:** demonstrates that a *retention-vs-attrition* framing (majority-stayed band drawn thick and calm, minority "switched away" bands peeling off in visibly different colors) is what makes this kind of chart emotionally legible without being sensational — directly relevant to telling a devastation story "with dignity" rather than for shock value. **Also right:** the published version pairs the diagram with a one-sentence plain-language caption stating the topline number in words ("56% ... roughly 35% ...") so the finding survives even if the reader never parses the ribbons — a redundant text encoding worth copying.

8. **USAFacts / SankeyMATIC "Federal Budget" pattern** (usafacts.org; sankeymatic.com/gallery/federal-budget.html) — the canonical "one revenue pool fans out into many spending categories" civic-data Sankey, the direct ancestor of the "where did it all go" genre the brief asked about. **Right:** shows the single-root, many-branch shape at scale (dozens of spending lines) by using a *secondary sort + collapse*: only the largest categories get their own named branch at top level, smaller ones are grouped into an "other" bucket that itself can expand — exactly the small-flow-handling technique we need for any long tail in our own data (e.g., rare/idiosyncratic parish outcomes).

---

## (b) Distilled rules

**Node count / stages**
- Static, non-interactive, single-glance charts top out at roughly **2–3 stages** and **6–10 total nodes per stage** before they stop reading as "one picture" and start reading as a diagram you have to study. Every practitioner source above converges on this even without citing an exact number — the common language is "the reader can't find the pattern" past a certain density.
- Add a stage only where it carries real information for *that specific branch* — an extra stage does not need to apply uniformly to every node from the previous stage (see building-fate recommendation below).

**Node ordering**
- Order nodes by narrative logic first, magnitude second. For an outcome chart, that usually means grouping "positive/survival" outcomes together and "negative/loss" outcomes together (spatially, e.g. top vs. bottom) so the eye reads the *shape* of the story before reading any single number.
- Alluvial/parallel-sets convention: node columns are fixed and vertically stacked at each stage; only Sankeys proper allow free node placement. Since our data is fixed discrete categories at each stage, use the aligned-column alluvial convention, and drop arrowheads (direction is already implied left-to-right or top-to-bottom).

**Labeling**
- Label directly on or immediately beside every node with name + count (n=), rather than relegating to a separate legend — a legend forces the reader to look away and back, which is friction a "see it all at once" chart shouldn't have. This is only feasible because node count is kept low (see above); it would not work at 30+ nodes.
- Redundantly encode the topline finding in a plain-language caption sentence near the chart (Pew's approach) so the finding is legible even to someone who doesn't parse ribbons at all.

**Color**
- Color by **destination/outcome category**, not by a single undifferentiated origin (our origin is one root node, so origin-coloring isn't meaningful here) and not decoratively by section.
- Use a restrained, low-saturation palette split into two families — one for "continuity" outcomes, one for "loss" outcomes — rather than an evenly-spaced categorical rainbow; a rainbow reads as neutral/administrative, which undercuts a dignity-and-loss story.
- Reserve the strongest color/contrast for the single most important branch (WSJ/Datawrapper "gray-out-the-rest" technique) rather than making every ribbon equally loud.
- Never encode meaning by color alone — pair every color with a text label and, ideally, position (redundant encoding), both for colorblind readers and for the alt-text/data-table fallback.

**Ribbon curvature / opacity**
- Standard smooth sigmoid/Bezier curves between aligned node columns; avoid gradient or glossy fills (reads corporate, undercuts the tone). Flat fills at moderate opacity (roughly 60–80%) keep overlapping ribbons legible at crossing/merge points without looking washed out.

**Small-flow handling**
- Don't let small counts shrink to invisible hairlines with no way to read them — set a visible minimum ribbon width and/or attach an explicit count label to small flows rather than relying on width alone.
- Where there's a genuine long tail (rare/idiosyncratic outcomes), collapse it into a single labeled "other" bucket rather than fragmenting into many one-off ribbons (USAFacts/budget-chart pattern) — this protects both readability and the emotional weight of the outcomes that matter most.

**Mobile / narrow viewport**
- Multi-stage flow diagrams get cramped fast under ~380–400px width; test at true mobile width, not just a scaled-down desktop view.
- For a static SVG with no interactivity, plan a simplified mobile treatment: either rotate the flow to a vertical top-to-bottom orientation (stages stack instead of running left-to-right), or provide a text/stacked-bar fallback under a breakpoint rather than shrinking every label until it's unreadable.

**Accessibility**
- Provide a visually-hidden data table (origin → outcome → count) alongside the chart, and a text alt-summary of the overall pattern — the single most effective accessibility technique across all the guidance gathered is redundant encoding (text carries the same finding the visual carries), not a color-only fix.
- Use a colorblind-safe palette (verify hue+saturation+lightness all vary, not hue alone) and never rely on a red/green-only distinction for survival vs. loss.

---

## (c) Recommendation for our chart

**Primary recommendation: an asymmetric 3-stage alluvial cascade** — Stage 1 is a single root node ("181 historical parishes"); Stage 2 is the five end states (still active / Lithuanian Mass continues / ethnically transferred / unresolved / closed), ordered top-to-bottom from continuity to loss; Stage 3 exists **only off the "closed" node**, splitting it into demolished / repurposed / still standing. Total node count stays at 9 (1 + 5 + 3), well inside the readable range, because the third stage is not forced onto branches that don't need it — per the Storytelling-with-Data and USAFacts patterns, a stage should earn its place on the branch where it carries real information, not apply uniformly for symmetry. This also lets the chart do the full emotional arc — whole, then fractured, then (for the fractured/closed share) physically erased or not — in one static image, without a second chart or a click-through, which best serves "see them as a whole." The single-root shape also gives the strongest possible visual metaphor for the story itself: one body of 181 communities, shown fanning apart.

**Second choice: a plain 2-stage alluvial** (root → five end states only), with building fate for the closed parishes handled as a separate, smaller companion visual (e.g., a compact icon tally or a small donut/strip sitting next to the "closed" node rather than a third Sankey stage). This is simpler and reads even faster, at the cost of losing the direct, traceable link between "closed" and "what happened to the building" inside a single image — the reader has to consciously connect two adjacent visuals instead of following one continuous ribbon. Choose this over the primary recommendation only if the building-fate breakdown turns out to apply to a small enough number of parishes that a full third stage would look thin/awkward, or if layout space is tight.

**Recommended against as the primary structure: a region-of-origin alluvial** (diocese/state as the left axis, flowing to end states). With 181 parishes spread across what is likely 15–30 dioceses/regions, a region-origin axis multiplies the node count into the hundreds of possible ribbon combinations — directly against every node-count guideline gathered above, and squarely in the "too much information, reader can't find the pattern" failure mode the Storytelling-with-Data and DataViz Catalogue sources warn about. It also asks one chart to do two jobs — encode *place* and encode *fate* — when the project (per the existing `diocese-boundaries-sources` research file) likely already has or can have a map for place. FT's own Visual Vocabulary keeps "Flow" and "Spatial" as separate chart families for exactly this reason: geography and process-outcome are different variables and read better in different chart forms. If geographic pattern matters to the story, it should live in a companion map or a filter/toggle on the alluvial, not as the alluvial's primary axis.
