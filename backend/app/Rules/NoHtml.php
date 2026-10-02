<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Interdit tout contenu ressemblant à du HTML (balises ou protocoles
 * dangereux). Première ligne de défense anti-XSS / anti-injection : le
 * contenu est refusé avant même d'atteindre la base de données.
 */
class NoHtml implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        $dangerous = [
            '/<\s*\/?\s*[a-zA-Z!]/',                 // balises HTML
            '/<\s*script/i',                          // script
            '/javascript\s*:/i',                      // pseudo-protocole
            '/data\s*:\s*text\/html/i',               // data URI HTML
            '/on[a-z]+\s*=/i',                        // gestionnaires d'événements inline
        ];

        foreach ($dangerous as $pattern) {
            if (preg_match($pattern, $value) === 1) {
                $fail('Le champ :attribute contient du contenu non autorisé.');

                return;
            }
        }
    }
}
