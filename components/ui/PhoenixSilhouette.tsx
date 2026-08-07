/**
 * PhoenixSilhouette — the bird from the brand mark, as animatable vector art.
 *
 * Not hand-drawn: these paths are the mark's own geometry. The logo ships only
 * as raster (`aarnaa-mark.png`), and in it the phoenix and the letter "A" are a
 * single fused shape — the bird's tail doubles as the A's left leg and its
 * outstretched wing as the crossbar — so there was no layer to lift out.
 *
 * They were separated by stroke weight. The letterform is drawn as two heavy
 * solid wedges (~50px in the 404×407 source) while every part of the bird is
 * fine line-work (~10–28px), so a morphological opening at a radius between
 * those two weights isolates the letter exactly; subtracting it leaves the
 * bird. The remainder was then split into connected components and each whole
 * component assigned to a group — never split mid-feather, which would tear
 * the artwork apart the moment a wing rotates.
 *
 * Because the coordinates are the mark's own, at matching size this overlays
 * the PNG pixel-for-pixel. That is what lets <LoadingScreen /> cross-dissolve
 * raster → vector and read as one object coming loose rather than as two
 * assets swapping.
 *
 * The groups, and why they are these groups:
 *
 *   [data-wing="near"]  the long right sweep — the wing that reads as the
 *                       A's crossbar. Beats widest.
 *   [data-wing="far"]   outer feathers of the upper-left wing.
 *   [data-tail]         the streamers; they drag a beat behind the wings.
 *   [data-plume]        head, neck, breast and the inner wing. Static — in the
 *                       artwork the head and inner wing are one connected
 *                       shape, so rotating it would swing the head. That is
 *                       also anatomically right: primaries sweep, coverts
 *                       barely move.
 *
 * Rotate the groups about WING_PIVOT (GSAP `svgOrigin`) to fly it.
 *
 * Regenerating: the extraction scripts are not checked in — they were a
 * one-shot on the PNG. If the mark artwork ever changes, the paths below have
 * to be re-derived from it rather than edited by hand.
 */
import { cn } from "@/utils/cn";

interface PhoenixSilhouetteProps {
  className?: string;
}

/**
 * Where the wings meet the body, in viewBox units. Everything that beats
 * rotates about this point.
 */
export const WING_PIVOT = "196 196";

export default function PhoenixSilhouette({
  className,
}: PhoenixSilhouetteProps) {
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
             146 122, 147 121, 159 98 C 164 87, 170 77, 171 76 C 173 74, 173 73, 173 65 C 173 60, 172 57,
             172 58 M 12 60 C 11 61, 12 75, 14 84 C 19 109, 37 131, 61 142 C 73 148, 76 149, 77 149 C 77
             149, 80 150, 84 152 C 87 154, 90 155, 90 155 C 91 155, 104 161, 109 164 C 115 166, 116 166,
             113 163 C 109 158, 79 135, 66 126 C 59 121, 43 108, 39 104 C 29 93, 19 77, 17 69 C 17 64, 14
             58, 13 58 C 13 58, 12 59, 12 60 M 17 129 C 17 131, 23 144, 28 150 C 33 156, 43 165, 50 169 C
             56 172, 71 178, 78 179 C 88 181, 111 186, 117 187 C 119 188, 123 190, 126 191 C 137 196, 132
             188, 118 178 C 115 176, 111 174, 97 168 C 95 167, 88 165, 80 163 C 52 155, 38 148, 25 133 C
             20 127, 17 126, 17 129"
        />
      </g>

      <g data-tail>
        <path
          d="M 57 192 C 58 195, 72 201, 83 204 C 97 207, 101 208, 108 209 C 121 210, 130 214, 135 221 C
             137 225, 137 226, 137 233 C 137 247, 129 260, 111 274 C 103 279, 98 282, 81 293 C 58 308, 36
             329, 26 344 C 19 353, 10 371, 7 380 C 0 399, 0 404, 3 406 C 5 407, 24 407, 26 406 C 26 405,
             27 402, 27 399 C 28 390, 30 383, 33 373 C 38 359, 42 351, 51 339 C 61 326, 71 316, 89 303 C
             120 280, 123 278, 127 274 C 136 265, 142 255, 145 244 C 148 233, 147 226, 143 218 C 136 204,
             125 198, 100 196 C 80 194, 69 193, 65 191 C 59 189, 57 190, 57 192 M 120 255 C 118 256, 116
             258, 115 259 C 115 259, 111 261, 106 264 C 98 268, 94 269, 69 278 C 37 290, 22 301, 9 322 C 4
             330, -2 353, 1 353 C 2 353, 5 349, 5 346 C 6 344, 15 330, 21 323 C 26 316, 34 309, 41 304 C
             49 299, 52 298, 76 286 C 103 274, 110 269, 118 262 C 122 258, 126 252, 124 252 C 124 252, 122
             253, 120 255 M 246 264 C 245 265, 240 267, 234 270 C 228 272, 221 276, 217 277 C 214 279, 211
             280, 211 280 C 210 280, 207 282, 202 284 C 166 301, 152 308, 136 320 C 124 329, 105 348, 99
             358 C 94 365, 87 376, 86 379 C 85 382, 83 381, 81 377 C 78 368, 79 353, 84 341 C 90 327, 98
             313, 105 306 C 115 296, 117 293, 116 292 C 115 291, 113 292, 108 297 C 88 313, 73 331, 65 347
             C 59 360, 55 378, 57 392 C 58 406, 58 407, 71 407 C 82 407, 82 407, 86 398 C 90 385, 90 384,
             97 373 C 112 348, 129 331, 161 311 C 162 311, 164 309, 167 308 C 169 306, 171 305, 171 305 C
             172 305, 177 302, 184 299 C 191 296, 201 292, 206 290 C 210 288, 216 285, 217 285 C 218 284,
             221 283, 223 283 C 224 282, 228 280, 231 279 C 234 278, 237 276, 237 276 C 238 275, 240 275,
             241 275 C 243 275, 244 276, 246 279 L 249 284 249 273 C 249 268, 249 263, 248 263 C 248 263,
             247 264, 246 264"
        />
      </g>

      <g data-plume>
        <path
          d="M 49 5 C 45 15, 41 29, 40 39 C 38 58, 43 81, 52 97 C 56 103, 68 116, 70 116 C 71 116, 71 114,
             69 111 C 65 103, 56 83, 56 79 C 56 77, 58 78, 60 82 C 68 97, 96 122, 124 137 C 130 141, 143
             151, 148 155 C 156 163, 161 170, 164 180 C 167 188, 167 190, 168 202 C 168 209, 168 215, 168
             215 C 168 217, 172 215, 175 213 C 178 210, 192 191, 192 190 C 192 189, 193 188, 193 187 C 195
             186, 197 182, 202 172 C 207 163, 211 158, 217 152 C 225 144, 229 142, 240 141 C 244 140, 249
             139, 249 138 C 249 137, 244 134, 240 132 C 237 131, 234 130, 232 129 C 227 126, 221 126, 209
             128 C 203 129, 200 129, 196 127 C 192 127, 189 125, 189 125 C 187 123, 184 124, 184 125 C 184
             127, 191 134, 196 136 C 198 137, 200 138, 200 138 C 200 139, 197 144, 195 147 C 194 148, 191
             153, 188 158 C 184 167, 179 173, 176 173 C 175 173, 174 171, 172 167 C 170 160, 164 149, 158
             143 C 153 136, 141 127, 122 116 C 103 103, 92 95, 83 86 C 68 71, 63 62, 56 41 C 54 35, 54 32,
             54 17 C 54 6, 53 0, 53 0 C 52 0, 50 2, 49 5 M 217 157 C 216 158, 215 160, 215 160 C 215 161,
             214 164, 212 167 C 210 172, 209 175, 207 193 C 205 212, 202 220, 194 232 C 187 243, 176 253,
             165 261 C 159 265, 159 265, 161 266 C 162 266, 164 266, 165 265 C 167 264, 168 263, 169 263 C
             170 263, 187 253, 192 250 C 202 242, 212 229, 218 218 C 220 213, 221 211, 221 198 C 221 189,
             221 176, 221 169 C 221 160, 221 154, 220 154 C 220 154, 218 155, 217 157 M 92 218 C 89 224,
             66 269, 66 271 C 66 271, 67 272, 68 272 C 71 272, 77 264, 83 250 C 91 234, 91 234, 93 231 C
             97 224, 100 216, 100 215 C 98 213, 95 214, 92 218"
        />
      </g>

      <g data-wing="near">
        <path
          d="M 398 46 C 397 49, 395 53, 394 56 C 393 61, 391 64, 386 75 C 385 79, 383 82, 383 82 C 383 84,
             370 105, 363 114 C 350 131, 332 149, 318 159 C 316 160, 314 162, 313 163 C 311 165, 295 175,
             289 178 C 286 179, 283 178, 281 173 C 281 172, 280 170, 279 170 C 279 170, 279 175, 279 180 L
             279 191 284 188 C 287 186, 289 185, 290 185 C 290 185, 291 184, 293 183 C 294 182, 301 178,
             308 173 C 337 154, 359 132, 378 105 C 382 98, 384 95, 389 85 C 390 83, 392 81, 392 81 C 393
             81, 393 80, 393 80 C 393 79, 393 78, 394 78 C 395 78, 395 79, 394 80 C 394 81, 393 84, 392 87
             C 389 99, 389 103, 387 110 C 386 113, 384 118, 384 120 C 383 126, 375 144, 371 153 C 361 173,
             347 191, 328 210 C 315 222, 314 223, 303 231 C 299 234, 295 237, 295 237 C 294 238, 298 238,
             304 238 C 315 238, 315 238, 314 236 C 313 234, 314 233, 319 228 C 331 217, 343 205, 350 197 C
             368 174, 383 146, 392 119 C 392 116, 394 112, 394 111 C 395 110, 396 106, 396 104 C 399 88,
             400 84, 400 83 C 401 81, 404 55, 404 49 C 404 43, 403 42, 401 42 C 400 42, 399 43, 398 46 M
             243 111 L 243 123 238 123 L 234 123 236 125 C 237 126, 240 127, 242 128 C 247 129, 251 132,
             253 137 L 254 142 260 142 C 263 142, 265 142, 265 141 C 265 140, 254 119, 253 118 C 252 118,
             252 117, 252 117 C 252 116, 250 112, 248 107 L 243 99 243 111"
        />
        {/* Reconstructed wing root — see the note above. */}
        <path d="M 252 130 C 266 146, 278 164, 291 181 L 279 190 C 268 172, 256 152, 243 139 Z" />
      </g>
    </svg>
  );
}
