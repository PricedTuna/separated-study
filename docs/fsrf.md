# FSRS (Free Spaced Repetition Scheduler)

## 1. Introducción

FSRS es un algoritmo moderno de repetición espaciada utilizado en
aplicaciones como Anki. Su objetivo es **optimizar el momento en que se
revisa una tarjeta** para maximizar la retención y minimizar el tiempo
de estudio.

A diferencia de modelos antiguos (como SM-2), FSRS modela la memoria
humana usando variables continuas y ajustables.

------------------------------------------------------------------------

## 2. Conceptos clave

FSRS se basa en tres variables principales:

-   **D (Difficulty)**: dificultad de la tarjeta (0--1)
-   **S (Stability)**: estabilidad de la memoria (en días)
-   **R (Retrievability)**: probabilidad de recordar en un momento dado

### Relación fundamental

R se calcula como:

R(t) = exp(-t / S)

Donde: - t = tiempo desde la última revisión - S = estabilidad

------------------------------------------------------------------------

## 3. Flujo del algoritmo

Cada vez que el usuario responde una tarjeta:

1.  Se calcula la probabilidad de recuerdo (R)
2.  Se actualiza la dificultad (D)
3.  Se actualiza la estabilidad (S)
4.  Se calcula el siguiente intervalo

------------------------------------------------------------------------

## 4. Estados de una tarjeta

-   new → tarjeta nueva
-   learning → en aprendizaje
-   review → en revisión normal
-   relearning → olvidada y reaprendiendo

------------------------------------------------------------------------

## 5. Cálculo del siguiente intervalo

El objetivo es mantener una probabilidad de recuerdo objetivo (\~90%).

Intervalo ≈ S \* factor

Donde el factor depende de la respuesta del usuario:

-   Again → reduce S
-   Hard → incremento pequeño
-   Good → incremento normal
-   Easy → incremento grande

------------------------------------------------------------------------

## 6. Actualización de parámetros

### Dificultad

Se ajusta según el rendimiento:

-   Si fallas → aumenta
-   Si aciertas fácil → disminuye

### Estabilidad

-   Respuesta correcta → S aumenta
-   Respuesta incorrecta → S se reduce significativamente

------------------------------------------------------------------------

## 7. Ejemplo

Revisiones:

1.  Día 0 → nueva → intervalo 1 día
2.  Día 1 → correcto → intervalo 3 días
3.  Día 4 → correcto → intervalo 7 días
4.  Día 11 → fácil → intervalo 20 días

------------------------------------------------------------------------

## 8. Implementación simplificada (pseudo código)

``` ts
function review(card, rating) {
  const t = daysSince(card.lastReview)

  const R = Math.exp(-t / card.stability)

  card.difficulty = updateDifficulty(card.difficulty, rating)
  card.stability = updateStability(card.stability, card.difficulty, rating)

  const interval = card.stability * factor(rating)

  card.due = now + interval
}
```

------------------------------------------------------------------------

## 9. Ventajas frente a SM-2

-   Modelo más realista de memoria
-   Adaptación por tarjeta
-   Optimización basada en datos
-   Menor carga de estudio a largo plazo

------------------------------------------------------------------------

## 10. Base científica

-   Ebbinghaus --- Curva del olvido
-   Cepeda et al. (2006) --- Distributed Practice
-   Settles & Meeder (2016) --- Trainable Spaced Repetition
-   FSRS (2022--2023) --- optimización moderna basada en datasets reales
