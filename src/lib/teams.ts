import { supabase, isSupabaseConfigured } from "./supabase";

export interface Profile {
    id: string;
    full_name: string;
    team_id: string | null;
    role?: "owner" | "member";
}

export interface TeamMember {
    id: string;
    email: string;
    full_name: string;
    role: "owner" | "member";
}

export interface TeamInvite {
    id: string;
    team_id: string;
    email: string;
    status: "pending" | "accepted";
    createdAt: string;
}

/**
 * Get the current user's profile, creating it if it doesn't exist.
 */
export async function getProfile(): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create it
        const newProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || "User",
            team_id: null
        };
        const { data: created, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single();

        if (createError) return null;
        return created;
    }

    return data;
}

/**
 * Invite a user to the current user's team.
 */
export async function inviteUserToTeam(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: "Supabase not configured" };

    const profile = await getProfile();
    if (!profile) return { success: false, error: "Profile not found" };

    let teamId = profile.team_id;

    // If no team exists, create one
    if (!teamId) {
        const { data: team, error: teamError } = await supabase
            .from("teams")
            .insert({ owner_id: profile.id, name: `${profile.full_name}'s Team` })
            .select()
            .single();

        if (teamError) return { success: false, error: teamError.message };
        teamId = team.id;

        // Update profile with new team_id
        await supabase.from("profiles").update({ team_id: teamId }).eq("id", profile.id);
    }

    // Create the invite
    const { error: inviteError } = await supabase
        .from("team_invites")
        .insert({ team_id: teamId, email: email.toLowerCase(), status: "pending" });

    if (inviteError) return { success: false, error: inviteError.message };

    return { success: true };
}

/**
 * Get all members of the current user's team.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
    if (!isSupabaseConfigured) return [];

    const profile = await getProfile();
    if (!profile || !profile.team_id) return [];

    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, team_id")
        .eq("team_id", profile.team_id);

    if (error) return [];

    // Map profiles to TeamMember (we'd ideally join with auth for email, but let's assume metadata or just use names)
    // In a real app, you'd have emails in the profiles table or handle it differently
    return data.map(p => ({
        id: p.id,
        email: "", // email not easily accessible from other profiles in Supabase without a RPC or extra column
        full_name: p.full_name,
        role: "member" // simplified
    }));
}
