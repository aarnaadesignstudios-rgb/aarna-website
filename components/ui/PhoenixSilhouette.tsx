/**
 * PhoenixSilhouette — the bird from the brand mark, as animatable vector art.
 *
 * Extracted from the brand mark, not hand-drawn.
 *
 * The logo ships only as raster (`aarnaa-mark.png`) and in it the phoenix and
 * the letter "A" are one fused shape. They were separated by stroke weight: the
 * letterform is drawn as heavy solid wedges (~50px in the 404×407 source) while
 * the bird is fine line-work (~10–28px), so a morphological opening at a radius
 * between the two isolates the letter exactly.
 *
 * Removing the letter leaves hairline breaks wherever its diagonal crossed over
 * the bird. Those were stitched back: for each pair of pieces left closer than
 * 6px, and for the one real gap at the wing root (32.6px, where the crossbar
 * covered the join), the nearest points were measured and a tapered capsule
 * rasterised between them at the local stroke weight. Morphological closing is
 * the obvious tool and it does not work here — it seals narrow channels, but
 * these are stroke ENDS facing each other across open space, so the erosion
 * step takes back what the dilation added.
 *
 * Coverage is checked: bird ∪ letter is the mark with 0.00% of its ink lost, so
 * at matching size the two overlay the PNG exactly. That is what lets
 * <LoadingScreen /> cross-dissolve raster → vector and read as one object coming
 * apart rather than as assets being swapped.
 *
 * Regenerating: the extraction scripts are not checked in — they were a one-shot
 * on the PNG. If the artwork changes, these paths have to be re-derived from it
 * rather than edited by hand.
 */
/**
 * The groups, and why they are these groups:
 *
 *   [data-wing="near"]  the long sweep to the top right — the near wing, plus
 *                       the reconstructed root that attaches it to the body.
 *   [data-wing="far"]   outer feathers of the upper-left wing.
 *   [data-tail]         the streamers; they drag a beat behind the wings.
 *   [data-plume]        head, crest, beak, breast and the inner wing. Static —
 *                       in the artwork the head and inner wing are one
 *                       connected shape, so rotating it would swing the head.
 *                       That is also anatomically right: primaries sweep,
 *                       coverts barely move.
 *
 * Each moving group turns about ITS OWN pivot (GSAP `svgOrigin`), never one
 * shared shoulder: a group rotated about a point that is not its root drags
 * away from the body and opens a gap at the join. The near wing's root capsule
 * travels with the wing for the same reason — so the seam stays sealed while it
 * beats.
 */
import { cn } from "@/utils/cn";

interface PhoenixSilhouetteProps {
  className?: string;
}

/** Where the upper-left fan gathers at the shoulder, in viewBox units. */
export const WING_FAR_PIVOT = "150 190";
/** The reconstructed root of the near wing — the midpoint of its capsule. */
export const WING_NEAR_PIVOT = "268 152";
/** Where the streamers leave the body. */
export const TAIL_PIVOT = "133 266";

export default function PhoenixSilhouette({ className }: PhoenixSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 404 407"
      aria-hidden
      fill="currentColor"
      fillRule="evenodd"
      className={cn("h-full w-full overflow-visible text-gold", className)}
    >
      {/* Far wing first — it sits behind the body. */}
      <g data-wing="far">
        <path
          d="M 172 58 C 171 58, 165 71, 157 87 C 149 102, 142 115, 142 115 C 140 117, 141 121, 143 122 C
             146 122, 147 121, 159 98 C 164 87, 170 77, 171 76 C 173 74, 173 73, 173 65 C 173 60, 172
             57, 172 58 M 12 60 C 11 61, 12 75, 14 84 C 19 109, 37 131, 61 142 C 73 148, 76 149, 77 149
             C 77 149, 80 150, 84 152 C 87 154, 90 155, 90 155 C 91 155, 104 161, 109 164 C 115 166, 116
             166, 113 163 C 109 158, 79 135, 66 126 C 59 121, 43 108, 39 104 C 29 93, 19 77, 17 69 C 17
             64, 14 58, 13 58 C 13 58, 12 59, 12 60 M 17 129 C 17 131, 23 144, 28 150 C 33 156, 43 165,
             50 169 C 56 172, 71 178, 78 179 C 88 181, 111 186, 117 187 C 119 188, 123 190, 126 191 C
             137 196, 132 188, 118 178 C 115 176, 111 174, 97 168 C 95 167, 88 165, 80 163 C 52 155, 38
             148, 25 133 C 20 127, 17 126, 17 129"
        />
      </g>

      <g data-tail>
        <path
          d="M 57 192 C 58 195, 72 201, 83 204 C 97 207, 101 208, 108 209 C 121 210, 130 214, 135 221 C
             139 227, 138 238, 135 246 C 132 252, 132 252, 129 251 C 128 251, 126 251, 126 251 C 126
             251, 124 251, 122 251 C 120 252, 118 253, 117 256 C 115 259, 112 261, 106 264 C 98 268, 94
             269, 69 278 C 37 290, 22 301, 9 322 C 4 330, -2 353, 1 353 C 2 353, 5 349, 5 346 C 6 344,
             15 330, 21 323 C 26 316, 34 309, 41 304 C 49 299, 52 298, 76 286 C 97 276, 103 273, 110 268
             C 116 264, 116 264, 117 266 C 118 269, 111 274, 81 293 C 58 308, 36 329, 26 344 C 19 353,
             10 371, 7 380 C 0 399, 0 404, 3 406 C 5 407, 24 407, 26 406 C 26 405, 27 402, 27 399 C 29
             386, 33 369, 39 357 C 44 348, 58 330, 67 321 C 74 314, 101 293, 103 293 C 103 293, 104 294,
             106 295 L 108 297 106 298 C 93 308, 72 332, 65 347 C 59 360, 55 378, 57 392 C 58 406, 58
             407, 71 407 C 82 407, 82 407, 86 398 C 90 385, 90 384, 97 373 C 112 348, 129 331, 161 311 C
             162 311, 164 309, 167 308 C 169 306, 171 305, 171 305 C 172 305, 177 302, 184 299 C 191
             296, 201 292, 206 290 C 210 288, 216 285, 217 285 C 218 284, 221 283, 223 283 C 224 282,
             228 280, 231 279 C 234 278, 237 276, 237 276 C 238 275, 240 275, 241 275 C 243 275, 244
             276, 246 279 L 249 284 249 273 C 249 268, 249 263, 249 263 C 249 263, 247 264, 244 265 C
             242 266, 237 268, 232 270 C 227 273, 221 276, 217 277 C 214 279, 211 280, 211 280 C 210
             280, 207 282, 202 284 C 166 301, 152 308, 136 320 C 124 329, 105 348, 99 358 C 94 365, 87
             376, 86 379 C 85 382, 83 381, 81 377 C 74 360, 84 330, 107 304 C 110 301, 114 297, 116 296
             C 120 295, 122 289, 121 284 C 120 281, 120 280, 125 276 C 136 265, 142 256, 145 244 C 148
             233, 147 226, 143 218 C 136 204, 125 198, 100 196 C 80 194, 69 193, 65 191 C 59 189, 57
             190, 57 192"
        />
      </g>

      <g data-plume>
        <path
          d="M 49 5 C 45 15, 41 29, 40 39 C 38 58, 43 81, 52 97 C 56 103, 68 116, 70 116 C 71 116, 71
             114, 69 111 C 65 103, 56 83, 56 79 C 56 77, 58 78, 60 82 C 68 97, 96 122, 124 137 C 130
             141, 143 151, 148 155 C 156 163, 161 170, 164 180 C 167 188, 167 190, 168 202 C 168 209,
             168 215, 168 215 C 168 217, 172 215, 175 213 C 178 210, 192 191, 192 190 C 192 189, 193
             188, 193 187 C 195 186, 196 183, 202 172 C 209 160, 209 160, 212 161 L 215 162 212 167 C
             210 172, 209 175, 207 193 C 205 212, 202 220, 194 232 C 187 243, 176 253, 165 261 C 159
             265, 159 265, 161 266 C 162 266, 164 266, 165 265 C 167 264, 168 263, 169 263 C 170 263,
             187 253, 192 250 C 202 242, 212 229, 218 218 C 220 213, 221 212, 221 187 L 221 162 223 160
             C 227 157, 228 153, 227 148 C 226 146, 226 144, 227 144 C 227 143, 231 142, 235 141 C 242
             140, 243 140, 245 141 C 248 144, 252 145, 256 143 C 258 143, 261 142, 262 142 C 264 142,
             265 142, 265 141 C 265 141, 255 122, 253 118 C 253 117, 250 113, 248 108 L 244 99 243 111 L
             243 123 238 123 L 234 123 236 125 C 237 126, 240 127, 243 128 C 247 129, 248 130, 246 132 C
             244 134, 240 133, 233 129 C 227 126, 221 126, 209 128 C 203 129, 200 129, 196 127 C 192
             127, 189 125, 189 125 C 187 123, 184 124, 184 125 C 184 127, 191 134, 196 136 C 198 137,
             200 138, 200 138 C 200 139, 197 144, 195 147 C 194 148, 191 153, 188 158 C 184 167, 179
             173, 176 173 C 175 173, 174 171, 172 167 C 170 160, 164 149, 158 143 C 153 136, 141 127,
             122 116 C 103 103, 92 95, 83 86 C 68 71, 63 62, 56 41 C 54 35, 54 32, 54 17 C 54 6, 53 0,
             53 0 C 52 0, 50 2, 49 5 M 92 218 C 89 224, 66 269, 66 271 C 66 271, 67 272, 68 272 C 71
             272, 77 264, 83 250 C 91 234, 91 234, 93 231 C 97 224, 100 216, 100 215 C 98 213, 95 214,
             92 218 M 122 251 C 121 252, 118 253, 118 254 C 115 257, 116 258, 120 255 C 122 253, 124
             252, 124 252 C 126 252, 122 258, 119 261 C 116 263, 116 264, 117 266 C 118 268, 118 268,
             121 265 C 125 261, 132 253, 132 252 C 130 251, 125 250, 122 251 M 111 287 C 104 292, 103
             293, 105 294 C 107 297, 108 296, 112 293 C 115 291, 115 291, 116 292 C 117 293, 116 294,
             115 295 C 114 296, 114 297, 115 297 C 117 297, 120 294, 121 291 C 122 287, 121 282, 119 281
             C 119 281, 115 284, 111 287"
        />
      </g>

      <g data-wing="near">
        <path
          d="M 398 46 C 397 49, 395 53, 394 56 C 393 61, 391 64, 386 75 C 385 79, 383 82, 383 82 C 383
             84, 370 105, 363 114 C 350 131, 332 149, 318 159 C 316 160, 314 162, 312 163 C 310 165, 290
             177, 288 178 C 287 179, 285 178, 284 177 C 282 176, 282 176, 284 173 C 285 170, 285 170,
             278 155 C 269 138, 268 137, 266 137 C 263 136, 263 137, 265 140 C 265 142, 264 142, 262 142
             L 259 143 267 158 C 272 168, 276 174, 277 174 C 279 175, 279 176, 279 183 L 279 191 284 188
             C 287 186, 289 185, 290 185 C 290 185, 291 184, 293 183 C 294 182, 301 178, 308 173 C 337
             154, 359 132, 378 105 C 382 98, 384 95, 389 85 C 390 83, 392 81, 392 81 C 393 81, 393 80,
             393 80 C 393 79, 393 78, 394 78 C 395 78, 395 79, 394 80 C 394 81, 393 84, 392 87 C 389 99,
             389 103, 387 110 C 386 113, 384 118, 384 120 C 383 126, 375 144, 371 153 C 361 173, 347
             191, 328 210 C 315 222, 314 223, 303 231 C 299 234, 295 237, 295 237 C 294 238, 298 238,
             304 238 C 315 238, 315 238, 314 236 C 313 234, 314 233, 319 228 C 331 217, 343 205, 350 197
             C 368 174, 383 146, 392 119 C 392 116, 394 112, 394 111 C 395 110, 396 106, 396 104 C 399
             88, 400 84, 400 83 C 401 81, 404 55, 404 49 C 404 43, 403 42, 401 42 C 400 42, 399 43, 398
             46"
        />
      </g>
    </svg>
  );
}
