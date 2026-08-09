/**
 * LetterMark — the "A" from the brand mark, without the phoenix.
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
 * Two paths, because the letterform has two truthful states.
 *
 * The artwork draws the bird OVER the A, and where it crosses it cuts the
 * letter into three pieces — a 22px slot below the apex and a 49px slot above
 * the leg, both emerald. That is [data-letter="cut"], and it is what has to be
 * on screen while the bird is still there: heal the A early and the bird's
 * strokes turn gold-on-gold where they overlap it, and the crossings vanish.
 *
 * [data-letter="whole"] is the same letter with those two slots filled. Unlike
 * the bird's severed wing (two stroke ENDS across open space, where closing
 * provably fails and the join had to be drawn), these slots are narrow channels
 * between the parallel edges of a ~50px stroke — the case a morphological
 * closing is actually for. A disc of r=30 cannot fit through either slot, so
 * both fill, while the letter's own open interior is far wider and is left
 * alone.
 *
 * <LoadingScreen /> cross-fades cut → whole as the bird leaves frame, so the A
 * visibly heals behind it and the swap is never seen on its own.
 *
 * There is no left leg in either state, because the artwork does not draw one —
 * the phoenix's tail is the left leg. That is exactly why the two cannot be
 * pulled apart cleanly.
 */
import { cn } from "@/utils/cn";

interface LetterMarkProps {
  className?: string;
}

export default function LetterMark({ className }: LetterMarkProps) {
  return (
    <svg
      viewBox="0 0 404 407"
      aria-hidden
      fill="currentColor"
      fillRule="evenodd"
      className={cn("h-full w-full overflow-visible text-gold", className)}
    >
      <path
        data-letter="cut"
        d="M 184 33 L 173 56 173 66 C 173 71, 173 76, 174 76 C 174 77, 176 79, 177 81 C 178 83, 182
           90, 185 97 C 192 110, 198 120, 199 121 C 201 122, 208 122, 218 121 C 225 120, 226 120, 230
           121 C 233 122, 236 123, 239 123 L 243 123 243 110 L 243 98 230 73 C 223 60, 214 41, 209 32
           C 200 14, 199 11, 197 11 C 196 11, 190 21, 184 33 M 254 144 C 253 145, 252 145, 249 145 C
           243 144, 237 145, 233 150 C 226 156, 227 154, 227 190 C 228 213, 228 214, 230 214 C 231
           214, 242 209, 256 202 L 279 191 279 180 L 279 169 272 155 L 266 142 260 142 C 256 142, 254
           142, 254 144 M 283 244 C 278 248, 268 253, 262 257 L 250 263 249 273 C 249 285, 248 283,
           257 299 C 259 301, 261 306, 263 310 C 272 325, 273 329, 274 330 C 274 330, 276 333, 278 337
           C 290 358, 310 378, 332 390 C 339 394, 341 395, 351 399 C 361 403, 371 405, 383 406 C 401
           407, 401 407, 396 396 C 394 392, 387 379, 380 366 C 363 332, 340 287, 327 261 L 315 239 304
           238 L 293 238 283 244"
      />
      <path
        data-letter="whole"
        opacity="0"
        d="M 197 2 C 196 3, 196 5, 196 8 C 195 10, 190 21, 184 34 L 173 56 173 65 C 173 74, 173 76,
           175 79 C 177 81, 181 88, 184 96 C 190 106, 197 118, 199 121 C 199 121, 201 122, 204 123 C
           217 126, 225 134, 227 148 C 228 151, 228 155, 228 157 C 227 160, 227 163, 227 190 L 228 214
           232 214 C 253 218, 263 242, 251 260 C 249 264, 249 265, 249 274 C 249 285, 249 283, 257 299
           C 259 301, 261 306, 263 310 C 271 324, 273 328, 275 332 C 277 334, 278 336, 278 337 C 278
           337, 279 339, 281 341 C 282 344, 285 347, 286 350 C 292 357, 301 368, 308 374 C 325 388,
           328 392, 330 402 L 331 407 367 407 L 404 407 404 391 L 404 375 399 374 C 393 373, 386 370,
           382 365 C 378 361, 377 360, 353 314 C 345 297, 333 273, 327 261 L 315 239 306 238 C 296
           237, 292 236, 287 232 C 275 225, 270 208, 277 194 C 279 190, 279 187, 279 179 L 279 169 272
           155 C 269 148, 265 142, 265 142 C 263 142, 256 138, 252 135 C 246 129, 243 119, 243 105 C
           243 98, 243 98, 230 73 C 201 15, 199 11, 198 4 C 198 2, 197 1, 197 2"
      />
    </svg>
  );
}
