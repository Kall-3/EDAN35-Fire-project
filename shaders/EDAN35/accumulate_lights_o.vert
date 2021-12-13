#version 410

struct ViewProjTransforms
{
	mat4 view_projection;
	mat4 view_projection_inverse;
};

layout (std140) uniform CameraViewProjTransforms
{
	ViewProjTransforms camera;
};

uniform mat4 vertex_model_to_world;
uniform mat4 normal_model_to_world;
uniform mat4 vertex_world_to_clip;

out VS_OUT {
	vec3 vertex;
	vec3 texcoords;
	vec3 normal;
} vs_out;

layout (location = 0) in vec3 vertex;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec3 texcoords;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 binormal;

void main() {
	vs_out.vertex = vertex;
	vs_out.texcoords = texcoords;
	vs_out.normal = normal;

	gl_Position = camera.view_projection * vertex_model_to_world * vec4(vertex, 1.0);
}
